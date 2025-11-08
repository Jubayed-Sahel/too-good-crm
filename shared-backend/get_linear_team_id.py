"""
Get your Linear Team ID
"""

import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

LINEAR_API_KEY = os.getenv('LINEAR_API_KEY', '')

if not LINEAR_API_KEY:
    print("❌ LINEAR_API_KEY not found in .env file!")
    print("\nPlease add it to your .env file:")
    print("LINEAR_API_KEY=lin_api_your_key_here")
    exit(1)

# GraphQL query to get teams
query = """
{
  viewer {
    id
    name
    email
    organization {
      id
      name
    }
    teams {
      nodes {
        id
        name
        key
      }
    }
  }
}
"""

headers = {
    "Content-Type": "application/json",
    "Authorization": LINEAR_API_KEY
}

print("Fetching your Linear teams...\n")

try:
    response = requests.post(
        'https://api.linear.app/graphql',
        json={'query': query},
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        
        if 'errors' in data:
            print(f"❌ Error: {data['errors']}")
            exit(1)
        
        viewer = data['data']['viewer']
        
        print("=" * 60)
        print("YOUR LINEAR ACCOUNT INFO")
        print("=" * 60)
        print(f"Name: {viewer['name']}")
        print(f"Email: {viewer['email']}")
        print(f"Organization: {viewer['organization']['name']}")
        
        print("\n" + "=" * 60)
        print("YOUR LINEAR TEAMS")
        print("=" * 60)
        
        teams = viewer['teams']['nodes']
        
        if not teams:
            print("❌ No teams found!")
        else:
            for i, team in enumerate(teams, 1):
                print(f"\n{i}. {team['name']}")
                print(f"   Team ID: {team['id']}")
                print(f"   Team Key: {team['key']}")
        
        print("\n" + "=" * 60)
        print("NEXT STEPS")
        print("=" * 60)
        print("\n1. Copy one of the Team IDs above")
        print("2. Open test_linear_integration.py")
        print("3. Replace LINEAR_TEAM_ID with your Team ID")
        print("4. Run: python test_linear_integration.py")
        
    else:
        print(f"❌ HTTP Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ Exception: {str(e)}")
