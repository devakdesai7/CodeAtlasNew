import joblib
import os
import warnings

# Suppress sklearn warnings for clean terminal output
warnings.filterwarnings('ignore')

class MLEngine:
    def __init__(self, model_dir="."):
        print("[ML Service] Loading Models...")
        self.tfidf = joblib.load(os.path.join(model_dir, 'tfidf_vectorizer.pkl'))
        self.cat_encoder = joblib.load(os.path.join(model_dir, 'category_encoder.pkl'))
        self.cat_model = joblib.load(os.path.join(model_dir, 'xgboost_category_model.pkl'))
        self.sev_model = joblib.load(os.path.join(model_dir, 'xgboost_severity_model.pkl'))
        
        # Load YAKE gracefully
        try:
            import sys
            
            # --- PICKLE PATCH ---
            # The YAKE model was pickled with a custom class in the __main__ namespace.
            # We must inject a dummy class into __main__ so joblib can successfully unpickle it.
            if not hasattr(sys.modules['__main__'], 'EmergencyKeywordPipeline'):
                class EmergencyKeywordPipeline:
                    def extract_keywords(self, text):
                        # Fallback if the real class methods are missing
                        words = text.replace('.', '').replace(',', '').split()
                        return [(w, 1.0) for w in words if len(w) > 4][:5]
                sys.modules['__main__'].EmergencyKeywordPipeline = EmergencyKeywordPipeline
            # --------------------
            
            self.yake = joblib.load(os.path.join(model_dir, 'yake_model.pkl'))
            print("[ML Service] Yake Model Loaded.")
        except FileNotFoundError:
            self.yake = None
            print("[ML Service] Warning: yake_model.pkl not found. Using fallback extractor for testing.")

    def extract_keywords(self, text):
        if self.yake:
            # Assuming your yake model has an extract method
            # Adjust this to match your exact Yake class implementation
            return [kw[0] for kw in self.yake.extract_keywords(text)]
        else:
            # Fallback for manual testing when PKL is absent
            words = text.replace('.', '').replace(',', '').split()
            return [w for w in words if len(w) > 4][:5] # return some long words as mock keywords

    def predict_triage(self, text):
        # 1. Vectorize text
        X_tfidf = self.tfidf.transform([text])
        
        # 2. Predict Category
        cat_idx = self.cat_model.predict(X_tfidf)[0]
        category = self.cat_encoder.inverse_transform([cat_idx])[0]
        
        # 3. Predict Severity
        severity = int(self.sev_model.predict(X_tfidf)[0])
        
        return category, severity
