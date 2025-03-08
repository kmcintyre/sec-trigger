import tweepy 
from twitter_api_credentials import api_key, api_secret, access_token, access_token_secret

client = tweepy.Client(
    consumer_key=api_key, consumer_secret=api_secret,
    access_token=access_token, access_token_secret=access_token_secret
)

response = client.create_tweet(
    text="$PR Quinn, William J form 4 insider purchase 250000 shares at $12.0981 on 03/05 for $3,024,525 total cost"
)
print(f"https://twitter.com/user/status/{response.data['id']}")