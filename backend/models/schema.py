from .database import db
from datetime import datetime
import json

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    target_role = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class StudentProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    location = db.Column(db.String(100))
    linkedin = db.Column(db.String(200))
    github = db.Column(db.String(200))
    target_role = db.Column(db.String(100))
    cgpa = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "location": self.location,
            "linkedin": self.linkedin,
            "github": self.github,
            "target_role": self.target_role,
            "cgpa": self.cgpa
        }

class Skills(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    skill_name = db.Column(db.String(100), nullable=False)
    proficiency = db.Column(db.String(50)) # e.g., 'Strong', 'Developing', 'Needs Improvement', 'Missing'

    def to_dict(self):
        return {"id": self.id, "skill_name": self.skill_name, "proficiency": self.proficiency}

class Assessments(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assessment_type = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Float)
    details = db.Column(db.Text) # JSON string of factors/prob
    date = db.Column(db.DateTime, default=datetime.utcnow)

class QuizAttempts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(100))
    topic = db.Column(db.String(100))
    score = db.Column(db.Float)
    total_questions = db.Column(db.Integer)
    accuracy = db.Column(db.Float)
    difficulty = db.Column(db.String(50))
    attempt_date = db.Column(db.DateTime, default=datetime.utcnow)

class ResumeData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    data = db.Column(db.Text) # JSON of resume builder

class Jobs(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100))
    location = db.Column(db.String(100))
    description = db.Column(db.Text)
    required_skills = db.Column(db.String(200))
    preferred_skills = db.Column(db.String(200))
    
    def to_dict(self):
        return {
            "id": self.id, "title": self.title, "company": self.company, 
            "location": self.location, "description": self.description,
            "required_skills": self.required_skills, "preferred_skills": self.preferred_skills
        }

class JobMatches(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    match_score = db.Column(db.Float)
    matched_skills = db.Column(db.String(500))
    missing_skills = db.Column(db.String(500))

class ProgressHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    activity_type = db.Column(db.String(100))
    progress_notes = db.Column(db.Text)
    xp_awarded = db.Column(db.Integer, default=0)
    date = db.Column(db.DateTime, default=datetime.utcnow)

class RoadmapProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    target_role = db.Column(db.String(100))
    roadmap_item = db.Column(db.String(200))
    status = db.Column(db.String(50)) # Completed, In Progress, Recommended, Locked
    
class Badges(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    badge_name = db.Column(db.String(100))
    date_awarded = db.Column(db.DateTime, default=datetime.utcnow)

class Questions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100))
    topic = db.Column(db.String(100))
    text = db.Column(db.Text, nullable=False)
    options = db.Column(db.Text) # JSON string array
    correct_option = db.Column(db.String(100))
    explanation = db.Column(db.Text)
    difficulty = db.Column(db.String(50))

class LearnTopics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100))
    description = db.Column(db.Text)
    estimated_time = db.Column(db.String(50))
    
    def to_dict(self):
        return {"id": self.id, "name": self.name, "category": self.category, "description": self.description, "estimated_time": self.estimated_time}

class LearnModules(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('learn_topics.id'), nullable=False)
    title = db.Column(db.String(200))
    content = db.Column(db.Text) # Markdown or structured JSON
    order_index = db.Column(db.Integer)
    
    def to_dict(self):
        return {"id": self.id, "topic_id": self.topic_id, "title": self.title, "content": self.content, "order_index": self.order_index}
