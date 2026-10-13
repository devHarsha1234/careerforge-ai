# CareerForge AI

**Build your skills. Shape your career. Get placement-ready.**

## 1. Problem
Students often lack a structured path from learning to placement. While they acquire technical skills, they struggle to assess their actual readiness, identify specific skill gaps for their target roles, and follow a personalized preparation roadmap.

## 2. Solution
CareerForge AI is an integrated student career platform that provides a complete, persistent journey. It assesses current readiness using a trained machine learning model, identifies skill gaps, offers personalized recommendations, tracks progress through gamified quizzes and roadmaps, and builds a professional resume—all tailored to the student's specific career goal.

## 3. Features
- **Centralized Student Profile:** Persistent tracking of academics, skills, and target roles.
- **ML Placement Assessment:** Statistical estimate of placement probability based on historical data.
- **CareerForge Readiness Score:** A blended, platform-level preparation indicator using CGPA, quiz performance, and ML probability.
- **Skill Gap Engine:** Dynamically compares current skills against the target role's required skills.
- **Recommendation Engine:** Suggests specific learning paths based on identified weak or missing skills.
- **Quiz Engine:** Interactive quizzes that update skill proficiencies dynamically based on performance.
- **Resume Builder:** Automatically generates a professional PDF resume using actual stored profile data.
- **Skill-Based Job Matching:** Matches student skills against job requirements to calculate alignment scores.
- **Gamification:** Activity-driven progress tracking, XP, and badges (e.g., Quiz Master, Skill Builder, 7-Day Streak, Resume Ready).

## 4. Architecture
The application follows a robust multi-user architecture with an integrated React frontend and a Flask/SQLAlchemy backend. Data securely persists across sessions. All modules (assessment, skills, roadmap, resume, jobs) are strictly tied to the authenticated user's session using JWT tokens. 

## 5. Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Zustand, React Router, Axios, Lucide React
- **Backend:** Python, Flask, Flask-CORS, SQLite/PostgreSQL, SQLAlchemy, Flask-JWT-Extended, ReportLab
- **Machine Learning:** Scikit-learn, Pandas, Joblib

## 6. Dataset
The placement model is trained on a synthetic/academic dataset containing 8,000 records, split into 6,400 development/training samples and 1,600 holdout test samples. The target variable is `placed`.

## 7. ML Methodology
1. **Stratified Split:** Data split 80/20.
2. **Pipelines:** Numerical features imputed (median) and scaled. Categorical features imputed (most frequent) and one-hot encoded.
3. **5-Fold CV:** Candidate models evaluated exclusively on the development data using Stratified 5-Fold Cross-Validation.
4. **Selection:** Model selected based strictly on mean CV F1-score.
5. **Final Evaluation:** Final pipeline retrained on all development data and evaluated exactly once on the untouched holdout data.

## 8. Model Comparison
Mean 5-fold CV F1-scores:
- Logistic Regression: 0%
- Decision Tree: 21.19%
- Random Forest: 0%
- SVM: 0%
- KNN: 9.12%

## 9. Actual Metrics
The selected Decision Tree model evaluated on the holdout test set yielded:
- Accuracy: 66.5%
- Precision: 20.17%
- Recall: 21.78%
- F1-Score: 20.94%
- ROC-AUC: 49.86%

## 10. CareerForge Readiness Score
The CareerForge Readiness Score is an application-level indicator calculated as a weighted blend of:
- Academic Performance (CGPA, scaled) - 40% weight
- Practice Performance (Average Quiz Accuracy) - 60% weight
*(Note: This is separate from the ML statistical model and is not a guaranteed probability of placement.)*

## 11. Skill Gap Engine
Compares the student's stored proficiencies in the `Skills` table against the baseline skills required for their `target_role`.

## 12. Recommendation Engine
An explainable, priority-based recommendation system that suggests topics if the relevant skill is marked "Needs Improvement" or "Missing".

## 13. Quiz Engine
Tracks attempts, calculates accuracy, and dynamically updates the `Skills` table. If accuracy drops below 50%, the skill is downgraded to "Needs Improvement".

## 14. Resume Builder
Uses Python's `reportlab` to construct a selectable, formatted PDF resume dynamically from the SQLite `StudentProfile` and `Skills` data.

## 15. Job Matching
Uses lightweight skill-based matching (string comparison / overlap tracking) to determine match percentages and highlight missing skills.

## 16. Database
SQLite (`careerforge.db`) using SQLAlchemy models: `StudentProfile`, `Skills`, `Assessments`, `QuizAttempts`, `GamePerformance`, `CareerGoals`, `ResumeData`, `Jobs`, `JobMatches`, `ProgressHistory`, `RoadmapProgress`, `Badges`, `Questions`.

## 17. API
RESTful Flask API running on port 5000, enabling full CRUD for profiles, skill assessments, quizzes, and dynamic PDF generation. 

## 18. Local Setup
### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 19. Testing
- ML pipeline tested and verified for data leakage.
- Flask APIs tested via Axios integration.
- End-to-end integration verified: Profile updates → Quiz performance → Recommendations → Roadmap → PDF Resume generation.

## 20. Deployment
Ready for deployment. The frontend can be hosted on Vercel (using `VITE_API_URL` environment variables). The backend is configured with `gunicorn` in `requirements.txt` for platforms like Render or Railway. 

## 21. Limitations
- **ML Model:** The statistical baseline reflects the highly imbalanced nature of the dataset; it should be used for educational assessment, not guaranteed prediction.
- **Authentication:** Only a single development user is currently supported.
- **Job Matching:** Uses basic skill array matching, not a full semantic LLM.

## 22. Future Scope
- Integration with live job board APIs (e.g., LinkedIn, Indeed).
- Adding multi-user authentication (JWT/OAuth).
- Generative AI integrations for personalized mock interviews.
