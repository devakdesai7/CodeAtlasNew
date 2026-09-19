import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import xgboost as xgb

def train_and_test():
    # 1. Load the Training Data
    print("1. Loading training data...")
    df = pd.read_csv("triage_training_data_v3.csv")
    
    # Concatenate transcript and extracted keywords to form the final input feature
    X = df['text_content'] + " " + df['extracted_keywords'].fillna('')
    y_category = df['true_category']
    y_severity = df['true_severity'] # Ranges from 0 to 5

    # 2. Encode Labels
    print("2. Encoding categories...")
    label_encoder = LabelEncoder()
    y_category_encoded = label_encoder.fit_transform(y_category)

    # 3. Train / Test Split
    print("3. Splitting data into Train and Test sets...")
    X_train, X_test, y_cat_train, y_cat_test, y_sev_train, y_sev_test = train_test_split(
        X, y_category_encoded, y_severity, test_size=0.2, random_state=42
    )

    # 4. TF-IDF Vectorization
    print("4. Vectorizing text data with TF-IDF...")
    vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    # 5. Train the Category Model
    print("5. Training XGBoost Category Model...")
    cat_model = xgb.XGBClassifier(
        objective='multi:softmax', 
        num_class=len(label_encoder.classes_), 
        random_state=42
    )
    cat_model.fit(X_train_tfidf, y_cat_train)

    # 6. Train the Severity Model 
    print("6. Training XGBoost Severity Model...")
    sev_model = xgb.XGBClassifier(
        objective='multi:softmax', 
        num_class=6, 
        random_state=42
    )
    sev_model.fit(X_train_tfidf, y_sev_train)

    # 7. Test and Evaluate the Models
    print("\n========== EVALUATION RESULTS ==========")
    
    cat_predictions = cat_model.predict(X_test_tfidf)
    cat_acc = accuracy_score(y_cat_test, cat_predictions)
    print(f"\n[Category Model Accuracy]: {cat_acc * 100:.2f}%")
    print("Category Classification Report:")
    print(classification_report(y_cat_test, cat_predictions, target_names=label_encoder.classes_, zero_division=0))

    sev_predictions = sev_model.predict(X_test_tfidf)
    sev_acc = accuracy_score(y_sev_test, sev_predictions)
    print(f"\n[Severity Model Accuracy]: {sev_acc * 100:.2f}%")
    print("Severity Classification Report:")
    print(classification_report(y_sev_test, sev_predictions, zero_division=0))

    # 8. Save
    print("\n========== SAVING ARTIFACTS ==========")
    joblib.dump(vectorizer, 'tfidf_vectorizer.pkl')
    joblib.dump(label_encoder, 'category_encoder.pkl')
    joblib.dump(cat_model, 'xgboost_category_model.pkl')
    joblib.dump(sev_model, 'xgboost_severity_model.pkl')
    
    print("Successfully saved all models to disk. Ready for production!")

if __name__ == "__main__":
    train_and_test()
