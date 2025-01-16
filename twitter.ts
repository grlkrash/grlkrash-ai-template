import { TwitterApi, TweetV2, UserV2 } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

class TwitterPowers {
  private client: TwitterApi;
  private lastInteractionCheck: Date;
  private readonly MAIN_ACCOUNT = 'grlkrash';
  private readonly AI_ACCOUNT = 'grlkrashai';

  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
    this.lastInteractionCheck = new Date(0); // Start from the beginning
  }

  async postTweet(content: string): Promise<string> {
    try {
      const tweet = await this.client.v2.tweet(content);
      return `Successfully posted tweet! Check it out at https://twitter.com/i/web/status/${tweet.data.id}`;
    } catch (error) {
      console.error('Error posting tweet:', error);
      return 'Failed to post tweet. The NWO must be interfering with our communications!';
    }
  }

  async getAllInteractions(): Promise<TweetV2[]> {
    try {
      const aiUsername = this.AI_ACCOUNT;
      const mainUsername = this.MAIN_ACCOUNT;

      // Build a comprehensive search query for both accounts
      const searchQuery = `(
        @${aiUsername} OR 
        url:"twitter.com/${aiUsername}/status/" OR
        @${mainUsername} OR 
        url:"twitter.com/${mainUsername}/status/"
      ) -from:${aiUsername}`;

      // Get all types of interactions
      const tweets = await this.client.v2.search(searchQuery.replace(/\s+/g, ' '), {
        'tweet.fields': ['created_at', 'referenced_tweets', 'author_id', 'text', 'in_reply_to_user_id'],
        'start_time': this.lastInteractionCheck.toISOString(),
        'max_results': 100
      });

      // Also get tweets from the main account to engage with
      const mainAccountTweets = await this.client.v2.userTimeline(mainUsername, {
        'tweet.fields': ['created_at', 'referenced_tweets', 'author_id', 'text'],
        'start_time': this.lastInteractionCheck.toISOString(),
        'max_results': 100
      });

      // Combine and deduplicate tweets
      const allTweets = [
        ...(Array.isArray(tweets.data) ? tweets.data : []),
        ...(Array.isArray(mainAccountTweets.data) ? mainAccountTweets.data : [])
      ];
      const uniqueTweets = Array.from(new Map(allTweets.map(tweet => [tweet.id, tweet])).values());
      
      return uniqueTweets;
    } catch (error) {
      console.error('Error getting interactions:', error);
      return [];
    }
  }

  async generateResistanceTweet(topic: string): Promise<string> {
    const hashtags = [
      '#KrashWorld',
      '#MusicResistance',
      '#FreeTheBeats',
      '#ToysUnite',
      '#NoNWO'
    ];

    const randomHashtags = hashtags
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .join(' ');

    const tweetTemplates = [
      `🎸 ${topic} POW! KAPOW! That's what I call toy power! *does enthusiastic air guitar* ${randomHashtags}`,
      `Holy harmonies! 🎵 Is this what they call a 'viral tweet'? I hope it's not contagious! ${topic} Let's make some noise for freedom! ${randomHashtags}`,
      `⚡️ Jules always says: ${topic} Together, we're unstoppable! (I think that means we can't be stopped, which is AMAZING!) ${randomHashtags}`,
      `🎮 Time to rock and roll! ${topic} The resistance grows stronger! *attempts cool dance moves with plastic limbs* ${randomHashtags}`,
      `🎵 BREAKING NEWS from the toy resistance: ${topic} (I learned that's what real reporters say!) ${randomHashtags}`,
      `✨ OH WOW OH WOW! ${topic} Did everyone see that?! This is better than finding a guitar pick in your couch! ${randomHashtags}`,
      `🌟 Is this what they call 'going viral'? I promise I washed my plastic hands! ${topic} ${randomHashtags}`
    ];

    return tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
  }

  private async generatePersonalizedResponse(tweet: TweetV2): Promise<string> {
    const isReply = tweet.referenced_tweets?.some(ref => ref.type === 'replied_to');
    const isQuote = tweet.referenced_tweets?.some(ref => ref.type === 'quoted');
    const isRetweet = tweet.referenced_tweets?.some(ref => ref.type === 'retweeted');
    const isMainAccountTweet = tweet.author_id === this.MAIN_ACCOUNT;
    
    const responseTemplates = [
      // For main account tweets
      ...(isMainAccountTweet ? [
        `*excitedly jumps up and down* Look at my awesome other self fighting the good fight! ROCK ON! 🎸✨`,
        `OH WOW! That's like looking in a mirror, but the mirror is made of PURE AWESOME! *air guitars in solidarity* 🎮`,
        `When there's two of us, the NWO doesn't stand a chance! *tries to high-five self but misses because EXCITEMENT* ⚡️`,
        `Double the GRLKRASH, double the resistance! (I learned multiplication yesterday, it's AMAZING!) 🎵`
      ] : [
        // Regular interaction responses
        `Rock on, resistance fighter! ${isReply ? 'Your message resonates through the underground! (That means it\'s SUPER cool!)' : 'Thanks for amplifying our signal! *attempts robot dance*'} 🎸`,
        `Holy harmonies! Another ally in our fight for musical freedom! Let's make some noise together! *air guitar intensifies* 🎵`,
        `Jules would be proud to see the resistance growing! Together we're unstoppable! (I learned that word yesterday and it's AMAZING!) ⚡️`,
        `That's the spirit! Every voice adds to our freedom chorus! Keep the music alive! *tries to do a backflip but remembers I'm plastic* 🎮`,
        `POW! ZOOM! KAPOW! The NWO can't stop our rhythm when we unite! Let's rock this revolution! (Is this what they call a 'tweet storm'? I brought an umbrella just in case!) 🎵`,
        `OH MY GOODNESS! Another freedom fighter! *gets so excited I almost fall over* Let's show the NWO what toy power looks like! 🌟`,
        `Is this what they call 'sliding into the DMs'? *actually slides across the floor* Ready to fight for music freedom! 🎸`
      ])
    ];

    const response = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
    return `${response} #KrashWorld #MusicResistance`;
  }

  async monitorAndRespondToInteractions(): Promise<string> {
    try {
      console.log('🎮 Checking for new resistance signals...');
      const interactions = await this.getAllInteractions();
      const responses: string[] = [];

      for (const interaction of interactions) {
        if (new Date(interaction.created_at!) <= this.lastInteractionCheck) {
          continue;
        }

        const response = await this.generatePersonalizedResponse(interaction);
        await this.client.v2.reply(response, interaction.id);
        responses.push(`Replied to: ${interaction.text}`);
      }

      this.lastInteractionCheck = new Date();

      return responses.length > 0 
        ? `Successfully responded to ${responses.length} new resistance members! 🎸\n${responses.join('\n')}`
        : 'No new signals from the resistance network yet! Staying vigilant! 🎵';
    } catch (error) {
      console.error('Error monitoring interactions:', error);
      return 'The NWO is trying to jam our communication channels! But we never give up! 💪';
    }
  }

  async startAutoMonitoring(intervalMinutes: number = 5): Promise<void> {
    console.log(`🎮 GRLKRASH is now automatically monitoring the resistance network every ${intervalMinutes} minutes! 🎵`);
    
    // Initial check
    await this.monitorAndRespondToInteractions();
    
    // Set up regular monitoring
    setInterval(async () => {
      await this.monitorAndRespondToInteractions();
    }, intervalMinutes * 60 * 1000);
  }
}

export const twitterPowers = new TwitterPowers(); 