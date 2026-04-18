from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)
SCHEMES = [
    {
        'id': 1,
        'title': 'Pradhan Mantri Awas Yojana',
        'description': 'Housing assistance for low-income families. Provides financial support for home construction or purchase.',
        'eligibility_criteria': {
            'max_income': 500000,
            'occupations': None
        }
    },
    {
        'id': 2,
        'title': 'Ayushman Bharat',
        'description': 'Health insurance scheme providing coverage up to ₹5 lakhs per family per year for secondary and tertiary care.',
        'eligibility_criteria': {
            'max_income': 300000,
            'occupations': None
        }
    },
    {
        'id': 3,
        'title': 'MGNREGA',
        'description': 'Guaranteed wage employment for rural households. Provides 100 days of work per year at minimum wage.',
        'eligibility_criteria': {
            'max_income': 200000,
            'occupations': ['farmer', 'laborer', 'rural worker']
        }
    },
    {
        'id': 4,
        'title': 'Pradhan Mantri Jan Dhan Yojana',
        'description': 'Financial inclusion program providing banking services to unbanked citizens.',
        'eligibility_criteria': {
            'max_income': None,
            'occupations': None
        }
    },
    {
        'id': 5,
        'title': 'Mid-Day Meal Scheme',
        'description': 'Nutritional support for school children providing hot cooked meals in government schools.',
        'eligibility_criteria': {
            'max_income': 100000,
            'occupations': None
        }
    }
]

def check_eligibility(user_profile, scheme):
    """Check if user is eligible for a specific scheme"""
    income = int(user_profile.get('familyIncome', 0))
    occupation = user_profile.get('occupation', '').lower()

    criteria = scheme['eligibility_criteria']

    # Check income criteria
    if criteria['max_income'] and income > criteria['max_income']:
        return False

    # Check occupation criteria
    if criteria['occupations']:
        if not any(occ in occupation for occ in criteria['occupations']):
            return False

    return True

def get_eligibility_status(user_profile, scheme):
    """Determine the eligibility status for a scheme"""
    if check_eligibility(user_profile, scheme):
        income = int(user_profile.get('familyIncome', 0))
        criteria = scheme['eligibility_criteria']

        # High match if income is significantly below threshold
        if criteria['max_income'] and income < (criteria['max_income'] * 0.6):
            return 'High Match'
        else:
            return 'Eligible'
    else:
        return 'Not Eligible'

@app.route('/api/check-eligibility', methods=['POST'])
def check_eligibility_endpoint():
    try:
        user_profile = request.get_json()

        if not user_profile:
            return jsonify({'error': 'No user profile provided'}), 400

        eligible_schemes = []
        potential_schemes = []

        for scheme in SCHEMES:
            status = get_eligibility_status(user_profile, scheme)

            if status in ['High Match', 'Eligible']:
                eligible_schemes.append({
                    'id': scheme['id'],
                    'title': scheme['title'],
                    'description': scheme['description'],
                    'status': status
                })
            elif status == 'Not Eligible':
                # Include some schemes as potential matches for better UX
                if len(potential_schemes) < 2:  # Limit potential matches
                    potential_schemes.append({
                        'id': scheme['id'],
                        'title': scheme['title'],
                        'description': scheme['description'],
                        'status': 'Potential Match'
                    })

        # Combine eligible and potential schemes
        all_schemes = eligible_schemes + potential_schemes

        # If no schemes found, return at least one default
        if not all_schemes:
            default_scheme = SCHEMES[3]  # Pradhan Mantri Jan Dhan Yojana
            all_schemes = [{
                'id': default_scheme['id'],
                'title': default_scheme['title'],
                'description': default_scheme['description'],
                'status': 'Eligible'
            }]

        return jsonify({
            'schemes': all_schemes,
            'user_profile': user_profile,
            'total_schemes': len(all_schemes)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Flask backend is running'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)