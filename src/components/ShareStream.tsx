
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ShareStreamProps {
  streamId: string;
  getShareableLink: () => string;
}

const ShareStream = ({ streamId, getShareableLink }: ShareStreamProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = getShareableLink();
    if (!link) {
      toast.error('No active stream to share');
      return;
    }
    
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        toast.error('Failed to copy link');
        console.error('Copy failed: ', err);
      });
  };
  
  return (
    <div className="share-stream">
      <h3 className="text-sm font-medium mb-2">Share your stream</h3>
      <div className="flex space-x-2">
        <Input 
          value={getShareableLink()}
          readOnly
          className="bg-stream-muted"
          placeholder="Start a stream to generate a link"
          disabled={!streamId}
        />
        <Button 
          onClick={handleCopyLink} 
          variant="outline" 
          size="icon"
          disabled={!streamId}
          className={copied ? "bg-green-500 text-white" : ""}
        >
          {copied ? <Copy className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {streamId ? 'Share this link with others to join your stream' : 'Start a stream to generate a shareable link'}
      </p>
    </div>
  );
};

export default ShareStream;
