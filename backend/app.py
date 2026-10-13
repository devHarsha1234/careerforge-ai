import os
import json
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from models.database import db
from models.schema import StudentProfile, Jobs, Questions
from routes.api import api

def create_app():
    load_dotenv()
    app = Flask(__name__)
    CORS(app)
    
    db_url = os.environ.get('DATABASE_URL', 'sqlite:///careerforge.db')
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    raw_jwt_secret = os.environ.get('JWT_SECRET_KEY', 'careerforge-ai-production-jwt-secret-key-2026-rfc7518')
    if len(raw_jwt_secret) < 32:
        raw_jwt_secret = (raw_jwt_secret + '-careerforge-ai-rfc7518-padding-2026')[:48]
    app.config['JWT_SECRET_KEY'] = raw_jwt_secret
    
    jwt = JWTManager(app)
    db.init_app(app)
    
    app.register_blueprint(api, url_prefix='/api')
    app.register_blueprint(api, name='api_root')
    
    with app.app_context():
        db.create_all()
        seed_data()
        
    return app

def seed_data():
    if not Jobs.query.first():
        jobs = [
            Jobs(title="Software Engineer", company="Tech Corp", location="Remote", description="Develop software", required_skills="Python, SQL, React"),
            Jobs(title="Data Scientist", company="Data Inc", location="New York", description="Analyze data", required_skills="Python, Machine Learning, SQL"),
            Jobs(title="Full Stack Developer", company="Web Co", location="San Francisco", description="Build web apps", required_skills="HTML, CSS, JS, React, Node.js, SQL, MongoDB")
        ]
        db.session.add_all(jobs)
        db.session.commit()
        
    if not Questions.query.first():
        questions = [
            Questions(category="Programming", topic="Python", text="What is Python?", options=json.dumps(["A language", "A snake", "A car", "A planet"]), correct_option="A language", difficulty="Easy"),
            Questions(category="Database", topic="SQL", text="What is SQL?", options=json.dumps(["A DB language", "A snake", "A food", "A city"]), correct_option="A DB language", difficulty="Easy")
        ]
        db.session.add_all(questions)
        db.session.commit()

if __name__ == '__main__':
    app = create_app()
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=debug_mode, use_reloader=False, port=port)
