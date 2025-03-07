import tweepy 
from twitter_api_credentials import api_key, api_secret, access_token, access_token_secret

client = tweepy.Client(
    consumer_key=api_key, consumer_secret=api_secret,
    access_token=access_token, access_token_secret=access_token_secret
)

response = client.create_tweet(
    text="This Tweet was Tweeted using Tweepy and Twitter API v2!"
)
print(f"https://twitter.com/user/status/{response.data['id']}")