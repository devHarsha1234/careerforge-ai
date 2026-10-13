import pandas as pd
import numpy as np
import json
import joblib
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def main():
    # Load data
    train_full_df = pd.read_csv(r'H:\AI_Mini_Project\data\student_placement_train.csv')
    test_df = pd.read_csv(r'H:\AI_Mini_Project\data\student_placement_test.csv')

    # test_df doesn't have 'placed' column, so we create a holdout set from the training data
    train_df, holdout_df = train_test_split(train_full_df, test_size=0.2, random_state=42, stratify=train_full_df['placed'])

    # Basic stats for dataset report
    dataset_stats = {
        'train_samples': len(train_df),
        'test_samples': len(holdout_df),
        'columns': list(train_df.columns),
        'missing_values_train': {k: int(v) for k, v in train_df.isnull().sum().items()},
        'target_distribution_train': {str(k): int(v) for k, v in train_df['placed'].value_counts().items()}
    }
    
    with open(r'H:\AI_Mini_Project\reports\dataset_report.json', 'w') as f:
        json.dump(dataset_stats, f, indent=4)

    # Separate features and target
    X_train = train_df.drop(columns=['student_id', 'placed'])
    y_train = train_df['placed']
    
    X_test = holdout_df.drop(columns=['student_id', 'placed'])
    y_test = holdout_df['placed']

    # Features info
    features = list(X_train.columns)
    with open(r'H:\AI_Mini_Project\reports\features_info.json', 'w') as f:
        json.dump(features, f, indent=4)

    # Preprocessing
    numeric_features = X_train.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X_train.select_dtypes(include=['object', 'category']).columns.tolist()

    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])

    # Models
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Decision Tree': DecisionTreeClassifier(random_state=42),
        'Random Forest': RandomForestClassifier(random_state=42),
        'SVM': SVC(probability=True, random_state=42),
        'KNN': KNeighborsClassifier()
    }

    # Cross-validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_results = {}
    best_f1 = -1
    best_model_name = None

    print("Running cross-validation...")
    for name, model in models.items():
        pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                                   ('classifier', model)])
        
        scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring='f1', n_jobs=-1)
        mean_f1 = np.mean(scores)
        std_f1 = np.std(scores)
        cv_results[name] = {
            'mean_f1': float(mean_f1),
            'std_f1': float(std_f1)
        }
        print(f"{name} - Mean F1: {mean_f1:.4f}")
        
        if mean_f1 > best_f1:
            best_f1 = mean_f1
            best_model_name = name

    print(f"Best model: {best_model_name}")

    with open(r'H:\AI_Mini_Project\reports\model_comparison.json', 'w') as f:
        json.dump(cv_results, f, indent=4)

    # Retrain best model
    best_pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                                    ('classifier', models[best_model_name])])
    
    print("Retraining best model on full training data...")
    best_pipeline.fit(X_train, y_train)

    # Evaluate on test data
    print("Evaluating on test data...")
    y_pred = best_pipeline.predict(X_test)
    y_pred_proba = best_pipeline.predict_proba(X_test)[:, 1] if hasattr(best_pipeline.named_steps['classifier'], "predict_proba") else None

    eval_metrics = {
        'accuracy': float(accuracy_score(y_test, y_pred)),
        'precision': float(precision_score(y_test, y_pred)),
        'recall': float(recall_score(y_test, y_pred)),
        'f1': float(f1_score(y_test, y_pred))
    }
    
    if y_pred_proba is not None:
        eval_metrics['roc_auc'] = float(roc_auc_score(y_test, y_pred_proba))
    
    eval_report = {
        'best_model': best_model_name,
        'test_metrics': eval_metrics
    }

    with open(r'H:\AI_Mini_Project\reports\evaluation.json', 'w') as f:
        json.dump(eval_report, f, indent=4)

    # Save model
    joblib.dump(best_pipeline, r'H:\AI_Mini_Project\models\placement_model.joblib')
    print("Pipeline saved successfully.")

if __name__ == "__main__":
    main()
