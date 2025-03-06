
import React, { useState } from 'react';
import { ChevronRight, Play, ExternalLink, Filter } from 'lucide-react';
import Button from '../ui/Button';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
}

const VideoCategory: React.FC<{
  title: string;
  videos: Video[];
  onVideoClick: (video: Video) => void;
}> = ({ title, videos, onVideoClick }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          See all <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div 
            key={video.id}
            className="glass-card overflow-hidden group cursor-pointer transition-all hover:shadow-md"
            onClick={() => onVideoClick(video)}
          >
            <div className="relative aspect-video">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs py-1 px-2 rounded">
                {video.duration}
              </div>
            </div>
            <div className="p-3">
              <h4 className="font-medium line-clamp-2">{video.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{video.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VideoHub: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "All Videos" },
    { id: "chronic", name: "Chronic Disease" },
    { id: "medications", name: "Medications" },
    { id: "wellness", name: "Wellness" },
    { id: "nutrition", name: "Nutrition" },
  ];

  // Mock videos data
  const videos: Video[] = [
    {
      id: "1",
      title: "Understanding Diabetes: Symptoms and Management",
      thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGlhYmV0ZXN8ZW58MHx8MHx8fDA%3D",
      duration: "3:45",
      category: "Chronic Disease",
    },
    {
      id: "2",
      title: "How Blood Pressure Medications Work",
      thumbnail: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVkaWNhdGlvbnxlbnwwfHwwfHx8MA%3D%3D",
      duration: "5:12",
      category: "Medications",
    },
    {
      id: "3",
      title: "Mindfulness Techniques for Stress Reduction",
      thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWluZGZ1bG5lc3N8ZW58MHx8MHx8fDA%3D",
      duration: "4:30",
      category: "Wellness",
    },
    {
      id: "4",
      title: "Nutrition Basics for Heart Health",
      thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bnV0cml0aW9ufGVufDB8fDB8fHww",
      duration: "6:18",
      category: "Nutrition",
    },
    {
      id: "5",
      title: "Managing Asthma: Triggers and Treatments",
      thumbnail: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aW5oYWxlcnxlbnwwfHwwfHx8MA%3D%3D",
      duration: "4:55",
      category: "Chronic Disease",
    },
    {
      id: "6",
      title: "Antibiotics: What You Need to Know",
      thumbnail: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YW50aWJpb3RpY3N8ZW58MHx8MHx8fDA%3D",
      duration: "5:40",
      category: "Medications",
    },
  ];

  const chronicsVideos = videos.filter(v => v.category === "Chronic Disease");
  const medicationVideos = videos.filter(v => v.category === "Medications");
  const wellnessVideos = videos.filter(v => v.category === "Wellness" || v.category === "Nutrition");

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
  };

  const filteredVideos = selectedCategory === "all" 
    ? videos 
    : videos.filter(v => v.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="page-container">
      {selectedVideo ? (
        <div className="mb-8 animate-fade-in">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4"
            onClick={() => setSelectedVideo(null)}
          >
            &larr; Back to videos
          </Button>
          
          <div className="glass-card overflow-hidden">
            <div className="relative pb-[56.25%] h-0">
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center p-8">
                  <Play className="w-16 h-16 text-white/80 mb-4 mx-auto" />
                  <p className="text-white text-lg mb-4">Video Preview (Limited to 1 minute)</p>
                  <Button 
                    className="flex items-center mx-auto"
                    onClick={() => window.open(`https://youtube.com/watch?v=${selectedVideo.id}`, '_blank')}
                  >
                    Watch Full Video <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{selectedVideo.title}</h2>
              <p className="text-sm text-muted-foreground">{selectedVideo.category} • {selectedVideo.duration}</p>
              <div className="mt-4 text-sm">
                <p>This video provides educational information about {selectedVideo.title.toLowerCase()}. Watch the full video on YouTube for complete information.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Related Videos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos
                .filter(v => v.category === selectedVideo.category && v.id !== selectedVideo.id)
                .slice(0, 3)
                .map((video) => (
                  <div 
                    key={video.id}
                    className="glass-card overflow-hidden group cursor-pointer transition-all hover:shadow-md"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="relative aspect-video">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs py-1 px-2 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium line-clamp-2">{video.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{video.category}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold">Educational Video Hub</h1>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select 
                  className="border border-border rounded-md bg-background px-3 py-1 text-sm focus-ring"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="glass-card p-4 mb-8">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Educational note:</span> These videos provide general health information. Remember to consult with healthcare professionals for personalized advice.
              </p>
            </div>
            
            {selectedCategory === "all" ? (
              <>
                <VideoCategory 
                  title="Chronic Disease Management" 
                  videos={chronicsVideos} 
                  onVideoClick={handleVideoClick} 
                />
                <VideoCategory 
                  title="Medication Information" 
                  videos={medicationVideos} 
                  onVideoClick={handleVideoClick} 
                />
                <VideoCategory 
                  title="Wellness & Nutrition" 
                  videos={wellnessVideos} 
                  onVideoClick={handleVideoClick} 
                />
              </>
            ) : (
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVideos.map((video) => (
                    <div 
                      key={video.id}
                      className="glass-card overflow-hidden group cursor-pointer transition-all hover:shadow-md"
                      onClick={() => handleVideoClick(video)}
                    >
                      <div className="relative aspect-video">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs py-1 px-2 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium line-clamp-2">{video.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{video.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoHub;
