'use client'
import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChartComponent } from '../_components/bar-chart';

interface Post {
  id: string;
  message: string;
  image: string | null;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  engagedUsers: number;
  createdAt: string;
  permalink_url: string;
}

interface PageData {
  pageName: string;
  pageLogo: string;
  posts: Post[];
  paging: {
    cursors: {
      after: string;
    };
    next?: string;
  };
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const [expanded, setExpanded] = useState(false);

  const truncateText = (text: string, maxLines: number, charsPerLine: number) => {
    const lines = text.split('\n').slice(0, maxLines);
    return lines.map(line => line.length > charsPerLine ? line.slice(0, charsPerLine) + '...' : line).join('\n');
  };

  const truncatedMessage = truncateText(post.message, 3, 40);

  return (
    <Card className="w-full overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 h-48 md:h-auto">
          {post.image && <img src={post.image} alt="Post" className="w-full h-full object-cover" />}
        </div>
        <div className="w-full md:w-2/3 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
              <Button variant="outline" size="sm" asChild>
                <a href={post.permalink_url} target="_blank" rel="noopener noreferrer">View on Facebook</a>
              </Button>
            </div>
            <p className="text-sm mb-2">
              {expanded ? post.message : truncatedMessage}
              {post.message !== truncatedMessage && (
                <Button variant="link" size="sm" onClick={() => setExpanded(!expanded)}>
                  {expanded ? 'Show Less' : 'Show More'}
                </Button>
              )}
            </p>
          </div>
          <div className="bg-primary/10 p-2 rounded-md flex flex-wrap justify-between text-xs">
            <span className="mb-1 md:mb-0">Likes: {post.likes}</span>
            <span className="mb-1 md:mb-0">Comments: {post.comments}</span>
            <span className="mb-1 md:mb-0">Shares: {post.shares}</span>
            <span>Impressions: {post.impressions}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function FacebookPageInsights() {
  const { getToken } = useAuth();
  const [pageId, setPageId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [result, setResult] = useState<PageData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);



  const fetchData = async (after?: string) => {
    setLoading(true);
    setError('');
    try {
      const clerkToken = await getToken();
      const response = await fetch('/api/facebook-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clerkToken}`,
        },
        body: JSON.stringify({ pageId, accessToken, after }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data: PageData = await response.json();
      setResult(prevResult => 
        after && prevResult 
          ? { ...data, posts: [...prevResult.posts, ...data.posts] }
          : data
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col justify-center items-start flex-wrap px-4 pt-4 gap-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Facebook Page Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Page ID"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
            />
            <Input
              placeholder="Access Token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              type="password"
            />
            <Button
              onClick={() => fetchData()}
              disabled={loading || !pageId || !accessToken}
            >
              {loading ? 'Fetching...' : 'Fetch Data'}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>{result.pageName}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={result.pageLogo} alt={result.pageName} className="w-16 h-16 rounded-full mb-4" />
              {/* <BarChartComponent data={result.posts.map(post => ({ name: new Date(post.createdAt).toLocaleDateString(), value: post.likes }))} /> */}
            </CardContent>
          </Card>

          <div className="w-full space-y-4">
            {result.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {result.paging && result.paging.next && (
            <Button
              onClick={() => fetchData(result.paging.cursors.after)}
              className="mt-4"
            >
              Load More
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export { Alert, AlertDescription };