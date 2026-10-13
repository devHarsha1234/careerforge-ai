from flask import Blueprint, jsonify, request, send_file
import joblib
import pandas as pd
import json
import os
import tempfile
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from models.database import db
from models.schema import (
    User, StudentProfile, Skills, Assessments, QuizAttempts, 
    ResumeData, Jobs, JobMatches, ProgressHistory, RoadmapProgress, 
    Badges, Questions, LearnTopics, LearnModules
)

api = Blueprint('api', __name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FEATURES_PATH = os.path.join(BASE_DIR, 'reports', 'features_info.json')
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'placement_model.joblib')


def get_or_create_resume_store(user_id, user, profile):
    """Retrieve or initialize the user's structured ResumeData JSON store."""
    rec = ResumeData.query.filter_by(user_id=user_id).first()
    default_store = {
        "personal": {
            "name": (profile.name if profile and profile.name else user.name) or "",
            "email": (profile.email if profile and profile.email else user.email) or "",
            "phone": (profile.phone if profile and profile.phone else "") or "",
            "location": (profile.location if profile and profile.location else "") or "",
            "linkedin": (profile.linkedin if profile and profile.linkedin else "") or "",
            "github": (profile.github if profile and profile.github else "") or "",
            "portfolio": ""
        },
        "academic": {
            "institute": "",
            "degree": "",
            "branch": "",
            "graduation_year": "",
            "cgpa": str(profile.cgpa) if profile and profile.cgpa is not None else ""
        },
        "preferences": {
            "target_domain": user.target_role or "Software Development",
            "target_role": (profile.target_role if profile and profile.target_role else user.target_role) or "Software Developer"
        },
        "summary": "",
        "education": [],
        "projects": [],
        "experience": [],
        "skills": {
            "Programming Languages": [],
            "Web / Frameworks": [],
            "Databases": [],
            "AI / ML": [],
            "Developer Tools": [],
            "Cloud / Platforms": [],
            "Other Technical Skills": [],
            "Soft Skills": []
        },
        "certifications": [],
        "achievements": []
    }
    if not rec:
        rec = ResumeData(user_id=user_id, data=json.dumps(default_store))
        db.session.add(rec)
        db.session.commit()
        return rec, default_store

    try:
        stored = json.loads(rec.data) if rec.data else {}
    except Exception:
        stored = {}

    # Merge defaults for any missing keys
    for k, v in default_store.items():
        if k not in stored:
            stored[k] = v
        elif isinstance(v, dict) and isinstance(stored[k], dict):
            for sub_k, sub_v in v.items():
                if sub_k not in stored[k]:
                    stored[k][sub_k] = sub_v

    return rec, stored


@api.route('/auth/register', methods=['POST'])
@api.route('/auth/signup', methods=['POST'])
def register():
    data = request.json or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    target_role = (data.get('target_role') or 'Software Development').strip()

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if len(password) < 4:
        return jsonify({"error": "Password must be at least 4 characters"}), 400

    if User.query.filter(db.func.lower(User.email) == email).first():
        return jsonify({"error": "Email already exists"}), 409

    try:
        user = User(
            name=name,
            email=email,
            password_hash=generate_password_hash(password),
            target_role=target_role
        )
        db.session.add(user)
        db.session.flush()

        profile = StudentProfile(
            user_id=user.id,
            name=name,
            email=email,
            target_role=target_role
        )
        db.session.add(profile)
        db.session.commit()

        # Initialize clean ResumeData store
        get_or_create_resume_store(user.id, user, profile)

        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "User registered successfully",
            "access_token": access_token,
            "token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "target_role": user.target_role
            }
        }), 201
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Could not register account. Please try again."}), 500


@api.route('/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"error": "Invalid email or password"}), 401

    user = User.query.filter(db.func.lower(User.email) == email).first()
    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token,
            "token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "target_role": user.target_role
            }
        }), 200
    return jsonify({"error": "Invalid email or password"}), 401


@api.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200


@api.route('/features', methods=['GET'])
def features():
    try:
        with open(FEATURES_PATH, 'r') as f:
            return jsonify(json.load(f)), 200
    except FileNotFoundError:
        return jsonify({"error": "Features specification not found"}), 404


def calculate_careerforge_score(user_id, model_prob, profile, payload=None):
    """Calculate holistic CareerForge Readiness Score (0-100) separate from raw ML output."""
    quiz_avg = db.session.query(db.func.avg(QuizAttempts.accuracy)).filter_by(user_id=user_id).scalar() or 0
    roadmap_completed = RoadmapProgress.query.filter_by(user_id=user_id, status='Completed').count()

    if payload:
        cgpa_score = min(max(float(payload.get("cgpa", 0)) * 10.0, 0), 100)
        tech_score = (float(payload.get("coding_score", 0)) + float(payload.get("technical_score", 0)) + float(payload.get("aptitude_score", 0))) / 3.0
        exp_score = min((float(payload.get("projects_count", 0)) * 18.0) + (float(payload.get("internships_count", 0)) * 25.0) + (float(payload.get("github_projects", 0)) * 5.0), 100)
        pres_score = (float(payload.get("resume_score", 0)) + float(payload.get("linkedin_score", 0))) / 2.0
        interview_score = (float(payload.get("mock_interview_score", 0)) + float(payload.get("communication_score", 0)) + float(payload.get("soft_skills_score", 0))) / 3.0

        base_profile_score = (
            (cgpa_score * 0.20) +
            (tech_score * 0.30) +
            (exp_score * 0.20) +
            (pres_score * 0.15) +
            (interview_score * 0.15)
        )
        platform_bonus = (min(quiz_avg, 100) * 0.10) + min(roadmap_completed * 3, 15)
        total = (base_profile_score * 0.85) + platform_bonus
        return min(max(round(total), 0), 100)

    score = (model_prob * 0.5) + (min(quiz_avg, 100) * 0.25) + min(roadmap_completed * 5, 15)
    if profile and profile.cgpa:
        score += min(float(profile.cgpa) * 1.5, 15)
    return min(max(round(score), 0), 100)


@api.route('/predict', methods=['POST'])
@jwt_required()
def predict():
    current_user_id = int(get_jwt_identity())
    try:
        data = request.json
        if not data or not isinstance(data, dict):
            return jsonify({"error": "No valid assessment payload provided"}), 400

        with open(FEATURES_PATH, 'r') as f:
            features = json.load(f)

        missing_features = [f for f in features if f not in data or data[f] is None or data[f] == ""]
        if missing_features:
            return jsonify({"error": f"Missing required assessment fields: {', '.join(missing_features)}"}), 400

        # Domain & Logical Range Validations
        try:
            age = float(data['age'])
            cgpa = float(data['cgpa'])
            attendance = float(data['attendance_percentage'])
            backlogs = int(float(data['backlogs']))
            projects_count = int(float(data['projects_count']))
            major_projects = int(float(data['major_projects']))
            hack_part = int(float(data['hackathons_participated']))
            hack_won = int(float(data['hackathons_won']))
            internships_count = int(float(data['internships_count']))
            internship_months = int(float(data['internship_months']))
        except (ValueError, TypeError):
            return jsonify({"error": "Numeric fields contain invalid values"}), 400

        if not (16 <= age <= 100):
            return jsonify({"error": "Age must be between 16 and 100"}), 400
        if not (0 <= cgpa <= 10):
            return jsonify({"error": "CGPA must be between 0.0 and 10.0"}), 400
        if not (0 <= attendance <= 100):
            return jsonify({"error": "Attendance percentage must be between 0 and 100"}), 400
        if backlogs < 0 or projects_count < 0 or major_projects < 0 or hack_part < 0 or hack_won < 0 or internships_count < 0 or internship_months < 0:
            return jsonify({"error": "Counts and durations cannot be negative"}), 400
        if major_projects > projects_count:
            return jsonify({"error": "Major projects cannot exceed total completed projects"}), 400
        if hack_won > hack_part:
            return jsonify({"error": "Hackathons won cannot exceed hackathons participated"}), 400

        pct_fields = [
            'coding_score', 'aptitude_score', 'communication_score', 'technical_score',
            'coding_platform_score', 'linkedin_score', 'resume_score', 'soft_skills_score',
            'leadership_score', 'extracurricular_score', 'mock_interview_score'
        ]
        for pf in pct_fields:
            val = float(data.get(pf, 0))
            if not (0 <= val <= 100):
                return jsonify({"error": f"{pf.replace('_', ' ').title()} must be between 0 and 100"}), 400

        input_data = pd.DataFrame([data], columns=features)
        numeric_cols = [c for c in features if c not in ['gender', 'preferred_domain']]
        input_data[numeric_cols] = input_data[numeric_cols].apply(pd.to_numeric, errors='coerce')

        if input_data[numeric_cols].isnull().any().any():
            return jsonify({"error": "Invalid numeric values in assessment submission"}), 400

        model = joblib.load(MODEL_PATH)
        prediction = int(model.predict(input_data)[0])

        if hasattr(model.named_steps['classifier'], "predict_proba"):
            probability = round(float(model.predict_proba(input_data)[0][1]) * 100, 1)
        else:
            probability = 80.0 if prediction == 1 else 20.0

        profile = StudentProfile.query.filter_by(user_id=current_user_id).first()
        user = User.query.get(current_user_id)
        if profile:
            profile.cgpa = cgpa
            if data.get('preferred_domain'):
                profile.target_role = str(data.get('preferred_domain'))
                if user:
                    user.target_role = str(data.get('preferred_domain'))

        readiness_score = calculate_careerforge_score(current_user_id, probability, profile, payload=data)

        assessment = Assessments(
            user_id=current_user_id,
            assessment_type="Placement Readiness",
            score=readiness_score,
            details=json.dumps({"probability": probability, "payload": data, "prediction": prediction})
        )
        db.session.add(assessment)

        if not Badges.query.filter_by(user_id=current_user_id, badge_name="First Assessment").first():
            db.session.add(Badges(user_id=current_user_id, badge_name="First Assessment"))

        db.session.add(ProgressHistory(
            user_id=current_user_id,
            activity_type="Assessment",
            progress_notes=f"Completed 26-point assessment (Readiness: {readiness_score}/100)",
            xp_awarded=25
        ))
        db.session.commit()

        return jsonify({
            "prediction": prediction,
            "model_estimate": probability,
            "ml_model_probability": probability,
            "careerforge_score": readiness_score,
            "careerforge_readiness_score": readiness_score,
            "readiness_score": readiness_score,
            "ml_factors": ["Statistical terminal-node estimate from trained Decision Tree model"],
            "readiness_factors": [
                "Academic Foundation",
                "Technical Capability",
                "Practical Experience",
                "Professional Presence",
                "Interview Readiness"
            ]
        }), 200
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to evaluate assessment. Please verify your inputs."}), 500


@api.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    profile = StudentProfile.query.filter_by(user_id=current_user_id).first()
    latest_assessment = Assessments.query.filter_by(user_id=current_user_id).order_by(Assessments.date.desc()).first()

    quiz_acc = db.session.query(db.func.avg(QuizAttempts.accuracy)).filter_by(user_id=current_user_id).scalar() or 0
    quiz_count = QuizAttempts.query.filter_by(user_id=current_user_id).count()
    roadmap_comp = RoadmapProgress.query.filter_by(user_id=current_user_id, status='Completed').count()
    roadmap_tot = RoadmapProgress.query.filter_by(user_id=current_user_id).count() or 5
    badges_count = Badges.query.filter_by(user_id=current_user_id).count()
    total_xp = db.session.query(db.func.sum(ProgressHistory.xp_awarded)).filter_by(user_id=current_user_id).scalar() or 0

    top_priorities = []
    next_best_action = {
        "title": "Complete your Career Assessment",
        "description": "Unlock your personalized skill gap analysis, learning tracks, and career roadmap.",
        "action_text": "Start Assessment",
        "action_link": "/assessment",
        "category": "Onboarding"
    }

    if latest_assessment:
        details = json.loads(latest_assessment.details) if latest_assessment.details else {}
        payload = details.get("payload", {})
        coding_score = float(payload.get("coding_score", 0))
        technical_score = float(payload.get("technical_score", 0))
        resume_score = float(payload.get("resume_score", 0))
        projects_count = int(float(payload.get("projects_count", 0)))

        if coding_score < 75:
            top_priorities.append({
                "id": 1,
                "title": "Strengthen Data Structures & Problem Solving",
                "current": round(coding_score),
                "target": 75,
                "action_text": "Study DSA Modules",
                "action_link": "/learn"
            })
        if technical_score < 75:
            top_priorities.append({
                "id": 2,
                "title": "Improve Core Technical & SQL Fundamentals",
                "current": round(technical_score),
                "target": 75,
                "action_text": "Practice Quizzes",
                "action_link": "/practice"
            })
        if resume_score < 75 or projects_count < 2:
            top_priorities.append({
                "id": 3,
                "title": "Build & Structure Your ATS Resume",
                "current": round(resume_score),
                "target": 80,
                "action_text": "Open Resume Builder",
                "action_link": "/resume"
            })

        if not top_priorities:
            top_priorities.append({
                "id": 4,
                "title": "Validate Mastery Across Diagnostic Quizzes",
                "current": min(max(round(quiz_acc), 65), 100),
                "target": 90,
                "action_text": "Start Practice Session",
                "action_link": "/practice"
            })

        first_p = top_priorities[0]
        next_best_action = {
            "title": first_p["title"],
            "description": f"Your current benchmark is {first_p['current']}% against a recommended target of {first_p['target']}%. Closing this gap will directly improve your CareerForge Readiness.",
            "action_text": first_p["action_text"],
            "action_link": first_p["action_link"],
            "category": "Priority Action"
        }

    recent_activity = ProgressHistory.query.filter_by(user_id=current_user_id).order_by(ProgressHistory.date.desc()).limit(5).all()
    activity_data = [
        {
            "id": a.id,
            "title": a.progress_notes or a.activity_type,
            "type": a.activity_type,
            "xp": a.xp_awarded,
            "time": a.date.strftime('%Y-%m-%d %H:%M')
        }
        for a in recent_activity
    ]

    details_obj = json.loads(latest_assessment.details) if (latest_assessment and latest_assessment.details) else {}
    model_est = details_obj.get('probability', 0) if latest_assessment else 0
    readiness_val = calculate_careerforge_score(
        current_user_id,
        model_est,
        profile,
        payload=details_obj.get('payload')
    ) if latest_assessment else 0

    return jsonify({
        "user_name": (profile.name if profile and profile.name else user.name),
        "target_role": (profile.target_role if profile and profile.target_role else user.target_role) or "Software Development",
        "has_assessment": latest_assessment is not None,
        "readiness_score": readiness_val,
        "model_estimate": model_est,
        "next_best_action": next_best_action,
        "top_priorities": top_priorities,
        "stats": {
            "quiz_accuracy": min(max(round(quiz_acc, 1), 0), 100),
            "quizzes_taken": quiz_count,
            "roadmap_progress": round((roadmap_comp / roadmap_tot) * 100) if roadmap_tot > 0 else 0,
            "badges_earned": badges_count,
            "xp": total_xp
        },
        "recent_activity": activity_data
    }), 200


@api.route('/analysis', methods=['GET'])
@jwt_required()
def analysis():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    profile = StudentProfile.query.filter_by(user_id=current_user_id).first()
    latest_assessment = Assessments.query.filter_by(user_id=current_user_id).order_by(Assessments.date.desc()).first()

    if not latest_assessment:
        return jsonify({"error": "No assessment found. Please complete your assessment first."}), 404

    details = json.loads(latest_assessment.details) if latest_assessment.details else {}
    payload = details.get("payload", {})
    probability = details.get("probability", 0)
    readiness_score = calculate_careerforge_score(current_user_id, probability, profile, payload=payload)

    cgpa = float(payload.get("cgpa", 0))
    attendance = float(payload.get("attendance_percentage", 0))
    coding_score = float(payload.get("coding_score", 0))
    technical_score = float(payload.get("technical_score", 0))
    aptitude_score = float(payload.get("aptitude_score", 0))
    projects_count = int(float(payload.get("projects_count", 0)))
    internships_count = int(float(payload.get("internships_count", 0)))
    resume_score = float(payload.get("resume_score", 0))
    linkedin_score = float(payload.get("linkedin_score", 0))
    mock_interview = float(payload.get("mock_interview_score", 0))
    communication = float(payload.get("communication_score", 0))

    academic_comp = round(min((cgpa * 10 * 0.7) + (attendance * 0.3), 100))
    technical_comp = round((coding_score + technical_score + aptitude_score) / 3.0)
    experience_comp = round(min((projects_count * 20) + (internships_count * 30), 100))
    presence_comp = round((resume_score + linkedin_score) / 2.0)
    interview_comp = round((mock_interview + communication) / 2.0)

    strengths = []
    if cgpa >= 8.0:
        strengths.append(f"Strong academic record (CGPA {cgpa}/10.0)")
    if coding_score >= 75:
        strengths.append(f"Solid programming and problem-solving score ({round(coding_score)}%)")
    if technical_score >= 75:
        strengths.append(f"Strong core computer science foundation ({round(technical_score)}%)")
    if projects_count >= 3:
        strengths.append(f"Practical project portfolio ({projects_count} completed projects)")
    if internships_count >= 1:
        strengths.append(f"Industry exposure ({internships_count} internship(s) completed)")
    if communication >= 75:
        strengths.append(f"Clear technical communication & articulation ({round(communication)}%)")
    if not strengths:
        strengths.append("Baseline profile established — ready for structured skill building")

    gaps = []
    if coding_score < 75:
        gaps.append({
            "topic": "Data Structures & Problem Solving",
            "current_level": f"{round(coding_score)}%",
            "target_level": "75%+",
            "priority": "High",
            "recommended_action": "Complete the DSA learning modules and practice array, string, and binary search problems."
        })
    if technical_score < 75:
        gaps.append({
            "topic": "Core CS, SQL & Database Engineering",
            "current_level": f"{round(technical_score)}%",
            "target_level": "75%+",
            "priority": "High",
            "recommended_action": "Review SQL joins, indexing, normalization, and ACID properties in the Learning Tracks."
        })
    if projects_count < 2:
        gaps.append({
            "topic": "Hands-On Project Depth",
            "current_level": f"{projects_count} project(s)",
            "target_level": "3+ projects",
            "priority": "Medium",
            "recommended_action": "Build and document full-stack or domain-specific projects with verifiable GitHub repositories."
        })
    if resume_score < 75 or linkedin_score < 70:
        gaps.append({
            "topic": "Professional Presence & ATS Resume",
            "current_level": f"{round(presence_comp)}%",
            "target_level": "80%+",
            "priority": "Medium",
            "recommended_action": "Add your education, technical skills, and key project contributions in the Resume Builder."
        })
    if mock_interview < 70:
        gaps.append({
            "topic": "Interview Readiness & Articulation",
            "current_level": f"{round(mock_interview)}%",
            "target_level": "75%+",
            "priority": "Medium",
            "recommended_action": "Practice timed diagnostic quizzes and explain algorithmic trade-offs aloud."
        })
    if not gaps:
        gaps.append({
            "topic": "Advanced System Design & Consistency",
            "current_level": "Competitive",
            "target_level": "Placement Ready",
            "priority": "Low",
            "recommended_action": "Maintain quiz accuracy above 85% and tailor your resume for target roles."
        })

    target_domain = payload.get("preferred_domain") or (user.target_role if user else "Software Development")
    tier_label = "Placement Ready" if readiness_score >= 75 else ("Developing Candidate" if readiness_score >= 50 else "Foundation Stage")

    return jsonify({
        "model_estimate": probability,
        "careerforge_score": readiness_score,
        "readiness_score": readiness_score,
        "target_domain": target_domain,
        "current_position": {
            "target_role": target_domain,
            "tier": tier_label,
            "summary": f"Targeting {target_domain} roles with a CareerForge Readiness Score of {readiness_score}/100 ({tier_label})."
        },
        "components": [
            {"name": "Academic Foundation", "score": academic_comp, "explanation": f"Evaluated from your CGPA ({cgpa}) and attendance ({round(attendance)}%)."},
            {"name": "Technical Capability", "score": technical_comp, "explanation": f"Combined coding ({round(coding_score)}%), core CS ({round(technical_score)}%), and aptitude ({round(aptitude_score)}%)."},
            {"name": "Practical Experience", "score": experience_comp, "explanation": f"Based on {projects_count} project(s) and {internships_count} internship(s)."},
            {"name": "Professional Presence", "score": presence_comp, "explanation": f"Based on resume readiness ({round(resume_score)}%) and LinkedIn profile ({round(linkedin_score)}%)."},
            {"name": "Interview Readiness", "score": interview_comp, "explanation": f"Based on mock interview performance ({round(mock_interview)}%) and communication ({round(communication)}%)."}
        ],
        "strengths": strengths,
        "skill_gaps": gaps,
        "recommendations": [g["recommended_action"] for g in gaps],
        "recommended_learning": [
            {"title": "DSA Foundations & Complexity", "track": "DSA", "link": "/learn"},
            {"title": "Relational Databases & SQL Joins", "track": "SQL & DBMS", "link": "/learn"},
            {"title": "Modern Frontend & React Architecture", "track": "React", "link": "/learn"}
        ],
        "recommended_practice": [
            {"title": "DSA Problem-Solving Diagnostic", "topic": "DSA", "link": "/practice?topic=DSA"},
            {"title": "SQL & DBMS Query Challenge", "topic": "SQL & DBMS", "link": "/practice?topic=SQL%20%26%20DBMS"},
            {"title": "React Component & Hooks Quiz", "topic": "React", "link": "/practice?topic=React"}
        ]
    }), 200


@api.route('/quiz/topics', methods=['GET'])
@jwt_required()
def quiz_topics():
    return jsonify([
        {"id": "DSA", "name": "DSA", "description": "Arrays, trees, graphs, sorting, dynamic programming, and time-complexity analysis.", "xp_reward": 50, "question_count": 25},
        {"id": "SQL & DBMS", "name": "SQL & DBMS", "description": "Relational schema design, JOIN operations, indexing, normalization, and ACID transactions.", "xp_reward": 50, "question_count": 25},
        {"id": "React", "name": "React", "description": "Component lifecycle, Hooks (useState, useEffect), Virtual DOM, props, and state architecture.", "xp_reward": 50, "question_count": 25}
    ]), 200


@api.route('/quiz/questions', methods=['GET'])
@jwt_required()
def quiz_questions():
    raw_topic = request.args.get("topic", "").strip()
    difficulty = request.args.get("difficulty", "").strip()
    if not raw_topic:
        return jsonify({"error": "Topic parameter is required"}), 400

    norm_topic = raw_topic
    upper_topic = raw_topic.upper()
    if "SQL" in upper_topic or "DBMS" in upper_topic or "DATABASE" in upper_topic:
        norm_topic = "SQL & DBMS"
    elif "REACT" in upper_topic or "FRONTEND" in upper_topic:
        norm_topic = "React"
    elif "DSA" in upper_topic or "ALGO" in upper_topic or "DATA STRUCTURE" in upper_topic:
        norm_topic = "DSA"

    from sqlalchemy.sql.expression import func
    query = Questions.query.filter(Questions.topic == norm_topic)
    if difficulty and difficulty.lower() != 'all':
        query = query.filter(Questions.difficulty.ilike(f"%{difficulty}%"))

    questions = query.order_by(func.random()).limit(5).all()
    if len(questions) < 5:
        questions = Questions.query.filter(Questions.topic == norm_topic).order_by(func.random()).limit(5).all()

    seen_texts = set()
    res = []
    for q in questions:
        if q.text in seen_texts:
            continue
        seen_texts.add(q.text)
        res.append({
            "id": q.id,
            "topic": q.topic,
            "text": q.text,
            "options": json.loads(q.options),
            "correct_option": q.correct_option,
            "explanation": q.explanation or "Review the core concept in the Learning Tracks.",
            "difficulty": q.difficulty or "Medium"
        })
    return jsonify(res), 200


@api.route('/roadmap', methods=['GET'])
@jwt_required()
def roadmap():
    current_user_id = int(get_jwt_identity())
    latest_assessment = Assessments.query.filter_by(user_id=current_user_id).order_by(Assessments.date.desc()).first()
    payload = {}
    if latest_assessment and latest_assessment.details:
        try:
            payload = json.loads(latest_assessment.details).get("payload", {})
        except Exception:
            payload = {}

    coding_score = float(payload.get("coding_score", 65))
    tech_score = float(payload.get("technical_score", 65))
    projects_count = int(float(payload.get("projects_count", 1)))
    resume_score = float(payload.get("resume_score", 65))

    why_map = {
        "PHASE 1": (
            f"Your coding benchmark is currently {round(coding_score)}% (target 75%+), so mastering arrays, strings, and complexity analysis is your first priority."
            if latest_assessment else
            "Mastering core data structures and algorithmic complexity is the foundation for technical screening rounds."
        ),
        "PHASE 2": (
            f"Your technical fundamentals score is {round(tech_score)}%, making relational database design, SQL joins, and indexing essential next steps."
            if latest_assessment else
            "Every software engineering and data role evaluates SQL querying, schema normalization, and transaction reliability."
        ),
        "PHASE 3": (
            "Modern engineering roles require clean component architecture, state management, and API integration."
        ),
        "PHASE 4": (
            f"You currently have {projects_count} project(s) recorded. Recruiters look for 2–3 well-documented projects with clear technical contributions."
            if latest_assessment else
            "Translating conceptual knowledge into end-to-end projects proves practical engineering capability."
        ),
        "PHASE 5": (
            f"With a current resume readiness of {round(resume_score)}%, structuring an ATS-friendly resume and practicing mock interviews completes your preparation."
            if latest_assessment else
            "Aligning your resume with target job skills and refining interview articulation converts preparation into offers."
        )
    }

    items = RoadmapProgress.query.filter_by(user_id=current_user_id).all()
    if not items:
        default_items = [
            ("PHASE 1", "Data Structures & Algorithmic Foundations", ["Big-O Complexity", "Arrays & Sliding Window", "Strings & Hashing", "Binary Search & Recursion"]),
            ("PHASE 2", "SQL & Database Engineering", ["Relational Schemas & Keys", "INNER / LEFT / FULL Joins", "GROUP BY & Aggregations", "Indexing & ACID Properties"]),
            ("PHASE 3", "Frontend & Component Architecture", ["Declarative UI & JSX", "Props & Unidirectional Flow", "useState & useEffect Hooks", "API Integration"]),
            ("PHASE 4", "Portfolio & Project Execution", ["Full-Stack Architecture", "Clean GitHub Documentation", "Edge-Case Handling", "Deployment & Testing"]),
            ("PHASE 5", "Placement & Interview Readiness", ["ATS Resume Completion", "Skill-Match Alignment", "Timed Diagnostic Quizzes", "Behavioral & Technical Articulation"])
        ]
        for idx, (phase, title, topics) in enumerate(default_items):
            status = "In Progress" if idx == 0 else "Recommended"
            rp = RoadmapProgress(
                user_id=current_user_id,
                target_role="Dynamic",
                roadmap_item=json.dumps({"phase": phase, "title": title, "topics": topics}),
                status=status
            )
            db.session.add(rp)
            items.append(rp)
        db.session.commit()

    res = []
    found_current = False
    for idx, i in enumerate(items):
        try:
            data = json.loads(i.roadmap_item)
            phase_key = data.get("phase", f"PHASE {idx + 1}")
            title = data.get("title", i.roadmap_item)
            topics = data.get("topics", [])
        except Exception:
            phase_key = f"PHASE {idx + 1}"
            title = i.roadmap_item
            topics = []

        if i.status == "Completed":
            stage = "Completed"
        elif not found_current:
            stage = "Current"
            found_current = True
        else:
            stage = "Upcoming"

        res.append({
            "id": i.id,
            "phase": phase_key,
            "title": title,
            "status": i.status,
            "stage": stage,
            "why_recommended": why_map.get(phase_key, "Recommended based on your target career role and skill profile."),
            "topics": topics
        })

    return jsonify(res), 200


@api.route('/roadmap/progress', methods=['POST'])
@jwt_required()
def roadmap_progress():
    current_user_id = int(get_jwt_identity())
    data = request.json or {}
    item_id = data.get("item_id")
    status = data.get("status", "Completed")
    rp = RoadmapProgress.query.filter_by(id=item_id, user_id=current_user_id).first()
    if not rp:
        return jsonify({"error": "Roadmap milestone not found"}), 404

    rp.status = status
    if status == "Completed":
        if not Badges.query.filter_by(user_id=current_user_id, badge_name="Skill Builder").first():
            db.session.add(Badges(user_id=current_user_id, badge_name="Skill Builder"))
        db.session.add(ProgressHistory(
            user_id=current_user_id,
            activity_type="Roadmap",
            progress_notes="Completed a career roadmap phase",
            xp_awarded=30
        ))
    db.session.commit()
    return jsonify({"message": "Roadmap updated successfully"}), 200


@api.route('/jobs', methods=['GET'])
@jwt_required()
def jobs():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    profile = StudentProfile.query.filter_by(user_id=current_user_id).first()
    _, store = get_or_create_resume_store(current_user_id, user, profile)

    # Collect user's real skills from Skills table + structured profile/resume skills
    skill_set = set()
    for s in Skills.query.filter_by(user_id=current_user_id).all():
        if s.proficiency not in ["Missing"] and s.skill_name:
            skill_set.add(s.skill_name.strip().lower())

    skills_dict = store.get("skills", {})
    if isinstance(skills_dict, dict):
        for cat_skills in skills_dict.values():
            if isinstance(cat_skills, list):
                for sk in cat_skills:
                    if sk and str(sk).strip():
                        skill_set.add(str(sk).strip().lower())

    # Also infer verified skills from completed quizzes with >= 60% accuracy
    passed_quizzes = QuizAttempts.query.filter(QuizAttempts.user_id == current_user_id, QuizAttempts.accuracy >= 60).all()
    for pq in passed_quizzes:
        if pq.topic == "DSA":
            skill_set.update(["dsa", "data structures", "algorithms", "problem solving"])
        elif pq.topic == "SQL & DBMS":
            skill_set.update(["sql", "dbms", "databases"])
        elif pq.topic == "React":
            skill_set.update(["react", "javascript", "html", "css", "frontend"])

    all_jobs = Jobs.query.all()
    res = []
    for job in all_jobs:
        req = [s.strip() for s in (job.required_skills or "").split(',') if s.strip()]
        matched = []
        missing = []
        for r in req:
            r_low = r.lower()
            if any(r_low == us or r_low in us or us in r_low for us in skill_set):
                matched.append(r)
            else:
                missing.append(r)
        match_percentage = round((len(matched) / len(req)) * 100) if req else 0
        res.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location or "Remote / Hybrid",
            "description": job.description or "Technical role evaluated via normalized skill overlap.",
            "required_skills": req,
            "match_percentage": match_percentage,
            "matched_skills": matched,
            "missing_skills": missing,
            "match_label": "Skill Match",
            "matching_method": "Normalized Skill Overlap"
        })
    return jsonify(res), 200


@api.route('/progress', methods=['GET'])
@jwt_required()
def progress():
    current_user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=current_user_id).first()
    assessments = Assessments.query.filter_by(user_id=current_user_id).order_by(Assessments.date.asc()).all()
    latest_assessment = assessments[-1] if assessments else None

    quiz_attempts = QuizAttempts.query.filter_by(user_id=current_user_id).order_by(QuizAttempts.attempt_date.asc()).all()
    quiz_acc = db.session.query(db.func.avg(QuizAttempts.accuracy)).filter_by(user_id=current_user_id).scalar() or 0
    roadmap_comp = RoadmapProgress.query.filter_by(user_id=current_user_id, status='Completed').count()
    roadmap_tot = RoadmapProgress.query.filter_by(user_id=current_user_id).count() or 5
    total_xp = db.session.query(db.func.sum(ProgressHistory.xp_awarded)).filter_by(user_id=current_user_id).scalar() or 0

    hist = ProgressHistory.query.filter_by(user_id=current_user_id).order_by(ProgressHistory.date.desc()).limit(15).all()
    badges = Badges.query.filter_by(user_id=current_user_id).all()

    details_obj = json.loads(latest_assessment.details) if (latest_assessment and latest_assessment.details) else {}
    career_score = calculate_careerforge_score(
        current_user_id,
        details_obj.get('probability', 0),
        profile,
        payload=details_obj.get('payload')
    ) if latest_assessment else 0

    accuracy_val = min(max(round(quiz_acc, 1), 0), 100)
    roadmap_val = round((roadmap_comp / roadmap_tot) * 100) if roadmap_tot > 0 else 0

    readiness_timeline = [
        {"date": a.date.strftime("%Y-%m-%d"), "score": round(a.score)}
        for a in assessments
    ]
    topic_performance = {}
    for qa in quiz_attempts:
        t = qa.topic or "General"
        if t not in topic_performance:
            topic_performance[t] = {"attempts": 0, "total_accuracy": 0.0}
        topic_performance[t]["attempts"] += 1
        topic_performance[t]["total_accuracy"] += float(qa.accuracy or 0)

    topic_breakdown = [
        {
            "topic": k,
            "attempts": v["attempts"],
            "average_accuracy": round(v["total_accuracy"] / v["attempts"], 1)
        }
        for k, v in topic_performance.items()
    ]

    return jsonify({
        "career_readiness": career_score,
        "quiz_accuracy": accuracy_val,
        "quizzes_completed": len(quiz_attempts),
        "roadmap_completion": roadmap_val,
        "roadmap_completed_count": roadmap_comp,
        "roadmap_total_count": roadmap_tot,
        "total_xp": total_xp,
        "readiness_timeline": readiness_timeline,
        "topic_breakdown": topic_breakdown,
        "stats": {
            "readiness_score": career_score,
            "quiz_accuracy": accuracy_val,
            "roadmap_progress": roadmap_val,
            "xp": total_xp
        },
        "badges": [
            {
                "name": b.badge_name,
                "title": b.badge_name,
                "date": b.date_awarded.strftime("%Y-%m-%d"),
                "earned_at": b.date_awarded.strftime("%Y-%m-%d")
            }
            for b in badges
        ],
        "history": [
            {
                "activity": h.progress_notes,
                "title": h.activity_type,
                "xp": h.xp_awarded,
                "date": h.date.strftime("%Y-%m-%d %H:%M")
            }
            for h in hist
        ]
    }), 200


@api.route('/profile', methods=['GET', 'POST'])
@jwt_required()
def profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    prof = StudentProfile.query.filter_by(user_id=current_user_id).first()
    if not prof:
        prof = StudentProfile(user_id=current_user_id, name=user.name, email=user.email, target_role=user.target_role)
        db.session.add(prof)
        db.session.commit()

    rec, store = get_or_create_resume_store(current_user_id, user, prof)
    skills_records = Skills.query.filter_by(user_id=current_user_id).all()

    if request.method == 'POST':
        data = request.json or {}
        name = (data.get('name') or prof.name or user.name).strip()
        phone = (data.get('phone') if data.get('phone') is not None else prof.phone) or ""
        location = (data.get('location') if data.get('location') is not None else prof.location) or ""
        linkedin = (data.get('linkedin') if data.get('linkedin') is not None else prof.linkedin) or ""
        github = (data.get('github') if data.get('github') is not None else prof.github) or ""
        portfolio = (data.get('portfolio') if data.get('portfolio') is not None else store.get("personal", {}).get("portfolio", "")) or ""
        target_role = (data.get('target_role') or prof.target_role or user.target_role or "Software Development").strip()
        target_domain = (data.get('target_domain') or store.get("preferences", {}).get("target_domain") or target_role).strip()

        raw_cgpa = data.get('cgpa')
        if raw_cgpa is not None and str(raw_cgpa).strip() != "":
            try:
                cgpa_val = float(raw_cgpa)
                if not (0 <= cgpa_val <= 10):
                    return jsonify({"error": "CGPA must be between 0 and 10"}), 400
                prof.cgpa = cgpa_val
            except ValueError:
                return jsonify({"error": "Invalid CGPA value"}), 400
        elif raw_cgpa == "":
            prof.cgpa = None

        prof.name = name
        prof.phone = phone.strip()
        prof.location = location.strip()
        prof.linkedin = linkedin.strip()
        prof.github = github.strip()
        prof.target_role = target_role
        user.name = name
        user.target_role = target_role

        # Update structured academic & extended sections in ResumeData store
        store["personal"] = {
            "name": name,
            "email": user.email,
            "phone": prof.phone,
            "location": prof.location,
            "linkedin": prof.linkedin,
            "github": prof.github,
            "portfolio": portfolio.strip()
        }
        store["academic"] = {
            "institute": (data.get("institute") if data.get("institute") is not None else store["academic"].get("institute", "")).strip(),
            "degree": (data.get("degree") if data.get("degree") is not None else store["academic"].get("degree", "")).strip(),
            "branch": (data.get("branch") if data.get("branch") is not None else store["academic"].get("branch", "")).strip(),
            "graduation_year": str(data.get("graduation_year") if data.get("graduation_year") is not None else store["academic"].get("graduation_year", "")).strip(),
            "cgpa": str(prof.cgpa) if prof.cgpa is not None else ""
        }
        store["preferences"] = {
            "target_domain": target_domain,
            "target_role": target_role
        }

        # Sync primary academic entry to education list if education list is empty and institute is provided
        if store["academic"]["institute"] and not store.get("education"):
            store["education"] = [{
                "id": "edu-profile-1",
                "institute": store["academic"]["institute"],
                "degree": store["academic"]["degree"] or "Bachelor's Degree",
                "branch": store["academic"]["branch"] or "",
                "start_year": "",
                "end_year": store["academic"]["graduation_year"] or "",
                "cgpa": store["academic"]["cgpa"] or "",
                "location": prof.location or "",
                "coursework": "",
                "achievements": ""
            }]

        if "projects" in data and isinstance(data["projects"], list):
            store["projects"] = data["projects"]
        if "internships" in data and isinstance(data["internships"], list):
            store["experience"] = data["internships"]
        if "experience" in data and isinstance(data["experience"], list):
            store["experience"] = data["experience"]
        if "certifications" in data and isinstance(data["certifications"], list):
            store["certifications"] = data["certifications"]
        if "achievements" in data and isinstance(data["achievements"], list):
            store["achievements"] = data["achievements"]

        skills_input = data.get("skills_list") if "skills_list" in data else data.get("skills")
        if isinstance(skills_input, list):
            Skills.query.filter_by(user_id=current_user_id).delete()
            clean_skills = []
            for sk in skills_input:
                if isinstance(sk, dict):
                    sk_name = (sk.get("skill_name") or sk.get("name") or "").strip()
                    sk_cat = (sk.get("category") or "Programming Languages").strip()
                else:
                    sk_name = str(sk).strip()
                    sk_cat = "Programming Languages"
                if sk_name:
                    db.session.add(Skills(user_id=current_user_id, skill_name=sk_name, proficiency="Verified"))
                    clean_skills.append(sk_name)
                    if sk_cat not in store["skills"] or not isinstance(store["skills"].get(sk_cat), list):
                        store["skills"][sk_cat] = []
                    if not any(s.lower() == sk_name.lower() for s in store["skills"][sk_cat]):
                        store["skills"][sk_cat].append(sk_name)

        rec.data = json.dumps(store)
        db.session.commit()
        skills_records = Skills.query.filter_by(user_id=current_user_id).all()

    flat_skills = [s.skill_name for s in skills_records]
    checks = [
        bool(prof.name),
        bool(prof.phone),
        bool(prof.location),
        bool(store["academic"].get("institute")),
        bool(store["academic"].get("degree")),
        prof.cgpa is not None,
        bool(prof.linkedin or prof.github),
        len(flat_skills) > 0 or any(len(v) > 0 for v in store.get("skills", {}).values() if isinstance(v, list)),
        len(store.get("projects", [])) > 0
    ]
    completion_pct = round((sum(checks) / len(checks)) * 100)

    return jsonify({
        "name": prof.name or user.name,
        "email": user.email,
        "phone": prof.phone or "",
        "location": prof.location or "",
        "linkedin": prof.linkedin or "",
        "github": prof.github or "",
        "portfolio": store.get("personal", {}).get("portfolio", ""),
        "target_role": prof.target_role or user.target_role or "Software Development",
        "target_domain": store.get("preferences", {}).get("target_domain") or prof.target_role or "Software Development",
        "summary": store.get("summary", ""),
        "cgpa": prof.cgpa if prof.cgpa is not None else "",
        "institute": store.get("academic", {}).get("institute", ""),
        "degree": store.get("academic", {}).get("degree", ""),
        "branch": store.get("academic", {}).get("branch", ""),
        "graduation_year": store.get("academic", {}).get("graduation_year", ""),
        "skills_list": flat_skills,
        "projects": store.get("projects", []),
        "experience": store.get("experience", []),
        "certifications": store.get("certifications", []),
        "achievements": store.get("achievements", []),
        "completion_percentage": completion_pct
    }), 200


@api.route('/resume', methods=['GET', 'POST'])
@jwt_required()
def resume_data_endpoint():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    prof = StudentProfile.query.filter_by(user_id=current_user_id).first()
    rec, store = get_or_create_resume_store(current_user_id, user, prof)

    if request.method == 'POST':
        incoming = request.json or {}
        for section in ["personal", "academic", "preferences", "summary", "education", "projects", "experience", "skills", "certifications", "achievements"]:
            if section in incoming:
                store[section] = incoming[section]
        if "skills_by_category" in incoming and isinstance(incoming["skills_by_category"], dict):
            store["skills"] = incoming["skills_by_category"]
        if "target_role" in incoming and incoming["target_role"]:
            store.setdefault("preferences", {})["target_role"] = incoming["target_role"]

        # Keep StudentProfile synchronized with personal info edits in Resume Builder
        pers = store.get("personal", {})
        if prof and isinstance(pers, dict):
            if pers.get("name"):
                prof.name = pers["name"].strip()
                user.name = pers["name"].strip()
            if "phone" in pers:
                prof.phone = (pers.get("phone") or "").strip()
            if "location" in pers:
                prof.location = (pers.get("location") or "").strip()
            if "linkedin" in pers:
                prof.linkedin = (pers.get("linkedin") or "").strip()
            if "github" in pers:
                prof.github = (pers.get("github") or "").strip()

        prefs = store.get("preferences", {})
        if prof and isinstance(prefs, dict) and prefs.get("target_role"):
            prof.target_role = prefs["target_role"].strip()
            user.target_role = prefs["target_role"].strip()

        rec.data = json.dumps(store)
        db.session.commit()
        return jsonify({
            "message": "Resume data saved",
            "resume": store,
            "personal": store.get("personal", {}),
            "target_role": store.get("preferences", {}).get("target_role", "Software Development"),
            "summary": store.get("summary", ""),
            "education": store.get("education", []),
            "skills_by_category": store.get("skills", {}),
            "projects": store.get("projects", []),
            "experience": store.get("experience", []),
            "certifications": store.get("certifications", []),
            "achievements": store.get("achievements", [])
        }), 200

    # Sync latest profile contact fields into personal block if empty
    if prof:
        store["personal"]["name"] = store["personal"].get("name") or prof.name or user.name
        store["personal"]["email"] = store["personal"].get("email") or prof.email or user.email
        store["personal"]["phone"] = store["personal"].get("phone") or prof.phone or ""
        store["personal"]["location"] = store["personal"].get("location") or prof.location or ""
        store["personal"]["linkedin"] = store["personal"].get("linkedin") or prof.linkedin or ""
        store["personal"]["github"] = store["personal"].get("github") or prof.github or ""

    skills_records = Skills.query.filter_by(user_id=current_user_id).all()
    profile_skills = [s.skill_name for s in skills_records]

    return jsonify({
        "resume": store,
        "personal": store.get("personal", {}),
        "target_role": store.get("preferences", {}).get("target_role") or (prof.target_role if prof else user.target_role) or "Software Development",
        "summary": store.get("summary", ""),
        "education": store.get("education", []),
        "skills_by_category": store.get("skills", {}),
        "projects": store.get("projects", []),
        "experience": store.get("experience", []),
        "certifications": store.get("certifications", []),
        "achievements": store.get("achievements", []),
        "profile_snapshot": {
            "name": prof.name if prof else user.name,
            "email": user.email,
            "phone": prof.phone if prof else "",
            "location": prof.location if prof else "",
            "linkedin": prof.linkedin if prof else "",
            "github": prof.github if prof else "",
            "cgpa": prof.cgpa if (prof and prof.cgpa is not None) else "",
            "institute": store.get("academic", {}).get("institute", ""),
            "degree": store.get("academic", {}).get("degree", ""),
            "branch": store.get("academic", {}).get("branch", ""),
            "graduation_year": store.get("academic", {}).get("graduation_year", ""),
            "target_role": (prof.target_role if prof else user.target_role) or "Software Development",
            "skills": profile_skills,
            "projects": store.get("projects", [])
        }
    }), 200


@api.route('/resume/assist', methods=['POST'])
@jwt_required()
def resume_assist():
    """Deterministic, fact-preserving wording refinement. Never fabricates metrics or facts."""
    data = request.json or {}
    mode = data.get("mode") or data.get("type") or "project"
    raw_text = (data.get("text") or "").strip()

    if mode == "summary":
        role = (data.get("target_role") or "Software Developer").strip()
        skills = [str(s).strip() for s in (data.get("skills") or []) if s and str(s).strip()]
        degree = (data.get("degree") or "").strip()
        institute = (data.get("institute") or "").strip()

        clean = (raw_text[0].upper() + raw_text[1:]) if raw_text else ""
        if clean and not clean.endswith('.'):
            clean += '.'

        parts = [f"{role} candidate."]
        if degree and institute:
            parts.append(f"Pursuing {degree} at {institute}.")
        elif degree:
            parts.append(f"Background in {degree}.")
        if skills:
            parts.append(f"Skilled in {', '.join(skills[:6])}.")
        if clean:
            parts.append(clean)
        improved = " ".join(parts)
        return jsonify({"improved_text": improved, "bullets": [improved]}), 200

    if not raw_text:
        title = (data.get("title") or "Technical Project").strip()
        tech = (data.get("tech_stack") or "").strip()
        fallback = f"Developed {title}" + (f" using {tech}." if tech else ".")
        return jsonify({"improved_text": fallback, "bullets": [fallback]}), 200

    # Project / Experience factual bullet refinement
    prefix_replacements = [
        ("made a website", "Developed a web application"),
        ("made website", "Developed a responsive web application"),
        ("built a website", "Built a web application"),
        ("built a ", "Engineered a "),
        ("made an app", "Developed an application"),
        ("made app", "Developed an application"),
        ("i made", "Developed"),
        ("i built", "Engineered"),
        ("i created", "Created"),
        ("i worked on", "Contributed to"),
        ("worked on", "Contributed to the development of"),
        ("used ", "Implemented using ")
    ]
    tech_casing = [
        (r'\breact\b', 'React'),
        (r'\bpython\b', 'Python'),
        (r'\bsql\b', 'SQL'),
        (r'\bnode\.?js\b', 'Node.js'),
        (r'\bnode\b', 'Node.js'),
        (r'\bjavascript\b', 'JavaScript'),
        (r'\btypescript\b', 'TypeScript'),
        (r'\bpostgresql\b', 'PostgreSQL'),
        (r'\bmongodb\b', 'MongoDB'),
        (r'\bdocker\b', 'Docker'),
        (r'\bflask\b', 'Flask'),
        (r'\bdjango\b', 'Django'),
        (r'\bhtml\b', 'HTML'),
        (r'\bcss\b', 'CSS'),
        (r'\baws\b', 'AWS'),
        (r'\bapi\b', 'API'),
        (r'\brest api\b', 'REST API')
    ]
    import re as _re
    raw_parts = [p.strip() for p in raw_text.replace('\n', '.').split('.') if p.strip()]
    bullets = []
    for part in raw_parts:
        refined = part
        low = refined.lower()
        for old_p, new_p in prefix_replacements:
            if low.startswith(old_p):
                refined = new_p + refined[len(old_p):]
                break
        for pattern, proper in tech_casing:
            refined = _re.sub(pattern, proper, refined, flags=_re.IGNORECASE)
        refined = refined[0].upper() + refined[1:] if refined else ""
        if refined and not refined.endswith('.'):
            refined += '.'
        if refined:
            bullets.append(refined)

    improved_joined = " ".join(bullets)
    return jsonify({"improved_text": improved_joined, "bullets": bullets}), 200


@api.route('/resume/generate', methods=['POST'])
@jwt_required()
def generate_resume():
    """Generate an ATS-friendly PDF strictly from user-provided data. Zero fabricated projects or institutions."""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    prof = StudentProfile.query.filter_by(user_id=current_user_id).first()
    rec, store = get_or_create_resume_store(current_user_id, user, prof)

    # If request body includes updated resume state, persist it first
    incoming = request.json or {}
    if incoming and isinstance(incoming, dict):
        for section in ["personal", "academic", "preferences", "summary", "education", "projects", "experience", "skills", "certifications", "achievements"]:
            if section in incoming:
                store[section] = incoming[section]
        if "skills_by_category" in incoming and isinstance(incoming["skills_by_category"], dict):
            store["skills"] = incoming["skills_by_category"]
        if "target_role" in incoming and incoming["target_role"]:
            store.setdefault("preferences", {})["target_role"] = incoming["target_role"]
        rec.data = json.dumps(store)
        db.session.commit()

    pers = store.get("personal", {})
    prefs = store.get("preferences", {})
    full_name = (pers.get("name") or (prof.name if prof else "") or user.name or "Candidate").strip()
    target_role = (prefs.get("target_role") or (prof.target_role if prof else "") or user.target_role or "").strip()
    email = (pers.get("email") or user.email or "").strip()
    phone = (pers.get("phone") or (prof.phone if prof else "") or "").strip()
    location = (pers.get("location") or (prof.location if prof else "") or "").strip()
    linkedin = (pers.get("linkedin") or (prof.linkedin if prof else "") or "").strip()
    github = (pers.get("github") or (prof.github if prof else "") or "").strip()
    portfolio = (pers.get("portfolio") or "").strip()

    summary_text = (store.get("summary") or "").strip()
    education_list = [e for e in (store.get("education") or []) if isinstance(e, dict) and (e.get("institute") or e.get("degree"))]
    projects_list = [p for p in (store.get("projects") or []) if isinstance(p, dict) and p.get("include_in_resume", True) and (p.get("title") or p.get("name"))]
    experience_list = [x for x in (store.get("experience") or []) if isinstance(x, dict) and x.get("include_in_resume", True) and (x.get("organization") or x.get("company") or x.get("role"))]
    certs_list = [c for c in (store.get("certifications") or []) if (isinstance(c, dict) and c.get("name")) or (isinstance(c, str) and c.strip())]
    achievements_list = [a for a in (store.get("achievements") or []) if (isinstance(a, dict) and a.get("title")) or (isinstance(a, str) and a.strip())]
    skills_dict = store.get("skills") or {}

    fd, path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)

    doc = SimpleDocTemplate(
        path,
        pagesize=letter,
        rightMargin=42,
        leftMargin=42,
        topMargin=36,
        bottomMargin=36,
        pageCompression=0,
        title=f"{full_name} - Resume",
        author=full_name
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=21,
        alignment=0,
        textColor=colors.HexColor('#111827'),
        spaceAfter=2
    )
    role_style = ParagraphStyle(
        'DocRole',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        alignment=0,
        textColor=colors.HexColor('#374151'),
        spaceAfter=4
    )
    contact_style = ParagraphStyle(
        'ContactInfo',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        alignment=0,
        textColor=colors.HexColor('#4B5563'),
        spaceAfter=8
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#111827'),
        spaceBefore=8,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'BodyContent',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#1F2937'),
        spaceAfter=3
    )
    bullet_style = ParagraphStyle(
        'BulletContent',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor('#374151'),
        leftIndent=12,
        spaceAfter=2
    )

    def esc(val):
        return str(val or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    story = []

    # HEADER
    story.append(Paragraph(esc(full_name.upper()), title_style))
    if target_role:
        story.append(Paragraph(esc(target_role), role_style))

    contact_parts = [esc(x) for x in [email, phone, location, linkedin, github, portfolio] if x]
    if contact_parts:
        story.append(Paragraph(" &nbsp;|&nbsp; ".join(contact_parts), contact_style))
    story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#D1D5DB'), spaceAfter=6))

    # PROFESSIONAL SUMMARY
    if summary_text:
        story.append(Paragraph("PROFESSIONAL SUMMARY", section_heading))
        story.append(Paragraph(esc(summary_text), body_style))
        story.append(HRFlowable(width="100%", thickness=0.4, color=colors.HexColor('#E5E7EB'), spaceBefore=4, spaceAfter=4))

    # EDUCATION
    if education_list:
        story.append(Paragraph("EDUCATION", section_heading))
        for edu in education_list:
            inst = esc(edu.get("institute", ""))
            deg = esc(edu.get("degree", ""))
            branch = esc(edu.get("branch", ""))
            deg_line = f"{deg} — {branch}" if (deg and branch) else (deg or branch)
            years = " – ".join([esc(y) for y in [edu.get("start_year"), edu.get("end_year")] if y])
            cgpa_str = f"CGPA/Score: {esc(edu.get('cgpa'))}" if edu.get("cgpa") else ""
            right_meta = " | ".join([x for x in [years, cgpa_str, esc(edu.get("location", ""))] if x])

            row_data = [[
                Paragraph(f"<b>{inst}</b>" + (f"<br/>{deg_line}" if deg_line else ""), body_style),
                Paragraph(right_meta, ParagraphStyle('EduRight', parent=body_style, alignment=2))
            ]]
            edu_table = Table(row_data, colWidths=[370, 158])
            edu_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 1),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ]))
            story.append(edu_table)
            if edu.get("coursework"):
                story.append(Paragraph(f"• <b>Relevant Coursework:</b> {esc(edu.get('coursework'))}", bullet_style))
            if edu.get("achievements"):
                story.append(Paragraph(f"• <b>Academic Achievements:</b> {esc(edu.get('achievements'))}", bullet_style))
            story.append(Spacer(1, 3))
        story.append(HRFlowable(width="100%", thickness=0.4, color=colors.HexColor('#E5E7EB'), spaceBefore=2, spaceAfter=4))

    # TECHNICAL SKILLS
    non_empty_skill_cats = []
    if isinstance(skills_dict, dict):
        for cat, items in skills_dict.items():
            if isinstance(items, list):
                clean_items = [esc(s.strip()) for s in items if s and str(s).strip()]
                if clean_items:
                    non_empty_skill_cats.append((esc(cat), ", ".join(clean_items)))

    if non_empty_skill_cats:
        story.append(Paragraph("TECHNICAL SKILLS", section_heading))
        skill_rows = [
            [Paragraph(f"<b>{cat}:</b>", body_style), Paragraph(vals, body_style)]
            for cat, vals in non_empty_skill_cats
        ]
        st_table = Table(skill_rows, colWidths=[145, 383])
        st_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 1),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(st_table)
        story.append(HRFlowable(width="100%", thickness=0.4, color=colors.HexColor('#E5E7EB'), spaceBefore=4, spaceAfter=4))

    # PROJECTS
    if projects_list:
        story.append(Paragraph("PROJECTS", section_heading))
        for proj in projects_list:
            p_title = esc(proj.get("title") or proj.get("name", ""))
            p_role = esc(proj.get("role", ""))
            raw_tech = proj.get("tech_stack") or proj.get("technologies") or ""
            p_tech = esc(", ".join(raw_tech) if isinstance(raw_tech, list) else raw_tech)
            p_dur = esc(proj.get("duration", ""))
            p_git = esc(proj.get("github_url", ""))
            p_demo = esc(proj.get("live_url", ""))

            header_left = f"<b>{p_title}</b>"
            if p_role:
                header_left += f" — <i>{p_role}</i>"
            if p_tech:
                header_left += f" | <font color='#4B5563'>{p_tech}</font>"

            story.append(Paragraph(header_left + (f" ({p_dur})" if p_dur else ""), body_style))
            for b in (proj.get("bullets") or []):
                if b and str(b).strip():
                    story.append(Paragraph(f"• {esc(str(b).strip())}", bullet_style))
            if proj.get("description"):
                story.append(Paragraph(f"• {esc(proj.get('description'))}", bullet_style))
            if proj.get("contributions"):
                for line in str(proj.get("contributions")).split('\n'):
                    clean_l = line.strip().lstrip('•-*').strip()
                    if clean_l:
                        story.append(Paragraph(f"• {esc(clean_l)}", bullet_style))
            links_line = " | ".join([x for x in [f"GitHub: {p_git}" if p_git else "", f"Live: {p_demo}" if p_demo else ""] if x])
            if links_line:
                story.append(Paragraph(f"• {links_line}", bullet_style))
            story.append(Spacer(1, 3))
        story.append(HRFlowable(width="100%", thickness=0.4, color=colors.HexColor('#E5E7EB'), spaceBefore=2, spaceAfter=4))

    # EXPERIENCE
    if experience_list:
        story.append(Paragraph("EXPERIENCE", section_heading))
        for exp in experience_list:
            org = esc(exp.get("organization") or exp.get("company", ""))
            role = esc(exp.get("role", ""))
            exp_type = esc(exp.get("type", ""))
            dates = esc(exp.get("duration") or " – ".join([d for d in [exp.get("start_date"), exp.get("end_date")] if d]))
            loc = esc(exp.get("location", ""))
            title_str = f"<b>{role or org}</b>" + (f" — {org}" if (role and org) else "") + (f" ({exp_type})" if exp_type else "")
            meta_str = " | ".join([x for x in [dates, loc] if x])
            story.append(Paragraph(f"{title_str}" + (f" &nbsp;|&nbsp; <font color='#4B5563'>{meta_str}</font>" if meta_str else ""), body_style))
            for b in (exp.get("bullets") or []):
                if b and str(b).strip():
                    story.append(Paragraph(f"• {esc(str(b).strip())}", bullet_style))
            if exp.get("responsibilities"):
                for line in str(exp.get("responsibilities")).split('\n'):
                    clean_l = line.strip().lstrip('•-*').strip()
                    if clean_l:
                        story.append(Paragraph(f"• {esc(clean_l)}", bullet_style))
            if exp.get("achievements"):
                story.append(Paragraph(f"• <b>Key Outcome:</b> {esc(exp.get('achievements'))}", bullet_style))
            if exp.get("technologies"):
                story.append(Paragraph(f"• <b>Technologies:</b> {esc(exp.get('technologies'))}", bullet_style))
            story.append(Spacer(1, 3))
        story.append(HRFlowable(width="100%", thickness=0.4, color=colors.HexColor('#E5E7EB'), spaceBefore=2, spaceAfter=4))

    # CERTIFICATIONS
    if certs_list:
        story.append(Paragraph("CERTIFICATIONS", section_heading))
        for cert in certs_list:
            if isinstance(cert, str):
                story.append(Paragraph(f"• <b>{esc(cert)}</b>", bullet_style))
                continue
            c_name = esc(cert.get("name", ""))
            c_issuer = esc(cert.get("issuer", ""))
            c_date = esc(cert.get("date") or cert.get("year", ""))
            c_url = esc(cert.get("credential_url", ""))
            line = f"• <b>{c_name}</b>"
            if c_issuer:
                line += f" — {c_issuer}"
            if c_date:
                line += f" ({c_date})"
            if c_url:
                line += f" | {c_url}"
            story.append(Paragraph(line, bullet_style))
        story.append(HRFlowable(width="100%", thickness=0.4, color=colors.HexColor('#E5E7EB'), spaceBefore=4, spaceAfter=4))

    # ACHIEVEMENTS
    if achievements_list:
        story.append(Paragraph("ACHIEVEMENTS & LEADERSHIP", section_heading))
        for ach in achievements_list:
            if isinstance(ach, dict):
                a_title = esc(ach.get("title", ""))
                a_cat = esc(ach.get("category", ""))
                a_desc = esc(ach.get("description", ""))
                line = f"• <b>{a_title}</b>" + (f" ({a_cat})" if a_cat else "") + (f": {a_desc}" if a_desc else "")
                story.append(Paragraph(line, bullet_style))
            else:
                story.append(Paragraph(f"• {esc(ach)}", bullet_style))

    doc.build(story)

    if not Badges.query.filter_by(user_id=current_user_id, badge_name="Resume Ready").first():
        db.session.add(Badges(user_id=current_user_id, badge_name="Resume Ready"))
        db.session.commit()

    safe_filename = "".join(c if c.isalnum() else "_" for c in full_name).strip("_") or "Candidate"
    return send_file(path, as_attachment=True, download_name=f"{safe_filename}_Resume.pdf", mimetype='application/pdf')


@api.route('/learn/topics', methods=['GET'])
@jwt_required()
def learn_topics():
    topics = LearnTopics.query.all()
    res = []
    for t in topics:
        d = t.to_dict()
        mod_count = LearnModules.query.filter_by(topic_id=t.id).count()
        d["module_count"] = mod_count
        res.append(d)
    return jsonify(res), 200


@api.route('/learn/<int:topic_id>', methods=['GET'])
@jwt_required()
def learn_topic_details(topic_id):
    topic = LearnTopics.query.get(topic_id)
    if not topic:
        return jsonify({"error": "Topic not found"}), 404
    modules = LearnModules.query.filter_by(topic_id=topic_id).order_by(LearnModules.order_index).all()
    return jsonify({
        "topic": topic.to_dict(),
        "modules": [m.to_dict() for m in modules]
    }), 200


@api.route('/learn/complete', methods=['POST'])
@jwt_required()
def learn_complete():
    current_user_id = int(get_jwt_identity())
    data = request.json or {}
    module_title = (data.get("module_title") or "Learning Module").strip()

    db.session.add(ProgressHistory(
        user_id=current_user_id,
        activity_type="Learning",
        progress_notes=f"Completed learning module: {module_title}",
        xp_awarded=15
    ))
    new_badges = []
    if not Badges.query.filter_by(user_id=current_user_id, badge_name="Learning Started").first():
        db.session.add(Badges(user_id=current_user_id, badge_name="Learning Started"))
        new_badges.append("Learning Started")
    db.session.commit()
    return jsonify({
        "message": "Module marked complete",
        "xp_awarded": 15,
        "new_badges": new_badges
    }), 200


@api.route('/quiz/submit', methods=['POST'])
@jwt_required()
def quiz_submit():
    current_user_id = int(get_jwt_identity())
    data = request.json or {}
    total_q = int(data.get("total_questions", data.get("total", 1)))
    correct = int(data.get("correct_answers", data.get("score", 0)))
    raw_topic = data.get("topic", "DSA")

    topic = raw_topic
    upper_t = raw_topic.upper()
    if "SQL" in upper_t or "DBMS" in upper_t:
        topic = "SQL & DBMS"
    elif "REACT" in upper_t:
        topic = "React"
    elif "DSA" in upper_t:
        topic = "DSA"

    if total_q > 0:
        correct = min(max(correct, 0), total_q)
        raw_accuracy = (correct / total_q) * 100.0
        accuracy = min(max(round(raw_accuracy, 1), 0.0), 100.0)
    else:
        accuracy = 0.0

    xp = correct * 10

    attempt = QuizAttempts(
        user_id=current_user_id,
        category=topic,
        topic=topic,
        score=float(correct),
        total_questions=total_q,
        accuracy=accuracy
    )
    db.session.add(attempt)

    hist = ProgressHistory(
        user_id=current_user_id,
        activity_type="Quiz",
        progress_notes=f"Completed {topic} practice quiz with {accuracy}% accuracy",
        xp_awarded=xp
    )
    db.session.add(hist)

    new_badges = []
    quizzes = QuizAttempts.query.filter_by(user_id=current_user_id).count()
    if quizzes >= 1 and not Badges.query.filter_by(user_id=current_user_id, badge_name="Quiz Starter").first():
        db.session.add(Badges(user_id=current_user_id, badge_name="Quiz Starter"))
        new_badges.append({"name": "Quiz Starter", "icon": "Zap"})
    if (accuracy >= 80 or quizzes >= 5) and not Badges.query.filter_by(user_id=current_user_id, badge_name="Quiz Master").first():
        db.session.add(Badges(user_id=current_user_id, badge_name="Quiz Master"))
        new_badges.append({"name": "Quiz Master", "icon": "Award"})

    db.session.commit()
    return jsonify({
        "score": correct,
        "total": total_q,
        "accuracy": accuracy,
        "xp_earned": xp,
        "new_badges": new_badges
    }), 200

