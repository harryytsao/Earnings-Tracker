"use client";

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

interface Comment {
    id: string;
    author: {
        name: string;
        image: string;
    };
    content: string;
    timestamp: string;
    likes: number;
}

export function Comments() {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([
        {
            id: '1',
            author: {
                name: 'John Doe',
                image: 'https://github.com/ghost.png'
            },
            content: "Strong revenue growth this quarter, but I'm concerned about the declining net income.",
            timestamp: '2024-03-20T10:30:00Z',
            likes: 5,
        },
    ]);
    const [newComment, setNewComment] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            signIn();
            return;
        }
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now().toString(),
            author: {
                name: session.user?.name || 'Anonymous',
                image: session.user?.image || 'https://github.com/ghost.png'
            },
            content: newComment,
            timestamp: new Date().toISOString(),
            likes: 0,
        };

        setComments([comment, ...comments]);
        setNewComment('');
    };

    return (
        <div className="space-y-4">
            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                {!session && (
                    <div className="text-sm text-gray-600 mb-2">
                        Please <button onClick={() => signIn()} className="text-blue-500 hover:underline">sign in</button> to comment
                    </div>
                )}
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={session ? "Add your thoughts..." : "Sign in to comment"}
                    rows={3}
                    disabled={!session}
                />
                <button
                    type="submit"
                    className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors ${session ? 'hover:bg-blue-600' : 'opacity-50 cursor-not-allowed'
                        }`}
                    disabled={!session}
                >
                    Post Comment
                </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-2">
                                <img
                                    src={comment.author.image}
                                    alt={comment.author.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="font-semibold">{comment.author.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <button className="hover:text-blue-500 flex items-center space-x-1">
                                <span>👍</span>
                                <span>{comment.likes}</span>
                            </button>
                            <button className="hover:text-blue-500">Reply</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 