"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Sparkles, Bold, Italic, List, Type, ListChecks } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TiptapEditorProps {
    liveTranscript?: string;
}

export default function TiptapEditor({ liveTranscript }: TiptapEditorProps) {
    const lastInsertedRef = useRef<string>('');
    const [showBubble, setShowBubble] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            BubbleMenuExtension,
            Placeholder.configure({
                placeholder: 'Type "/" for commands or start recording...',
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] text-lg leading-relaxed',
            },
        },
        immediatelyRender: false,
    });

    // Auto-insert live transcription chunks
    useEffect(() => {
        if (editor && liveTranscript && liveTranscript !== lastInsertedRef.current) {
            lastInsertedRef.current = liveTranscript;

            // Insert at the end of the document with a space
            const { state } = editor;
            const endPos = state.doc.content.size;
            editor.commands.insertContentAt(endPos, ' ' + liveTranscript);
        }
    }, [liveTranscript, editor]);

    if (!editor) return null;

    // AI Logic: Send highlighted text to Go backend
    const handleAIAction = async (action: string) => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to);

        if (!selectedText) return;

        try {
            const token = localStorage.getItem('echo_token');
            const response = await fetch('http://localhost:8080/ai-format', {
                method: 'POST',
                body: JSON.stringify({ text: selectedText, action }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                const data = await response.json();
                editor.chain().focus().insertContentAt({ from, to }, data.result).run();
            } else {
                console.error('AI formatting failed:', await response.text());
            }
        } catch (err) {
            console.error('AI request error:', err);
        }
    };

    return (
        <div className="relative">
            {/* Formatting Toolbar */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-2 flex gap-2 mb-4">
                <button
                    onClick={() => handleAIAction('beautify')}
                    className="flex items-center gap-1 px-3 py-1.5 hover:bg-indigo-50 text-indigo-600 rounded text-sm font-bold border border-indigo-200"
                >
                    <Sparkles size={14} /> AI Clean
                </button>
                <div className="w-[1px] bg-slate-200 mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 hover:bg-slate-100 rounded ${editor.isActive('bold') ? 'bg-slate-200' : ''}`}
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 hover:bg-slate-100 rounded ${editor.isActive('italic') ? 'bg-slate-200' : ''}`}
                >
                    <Italic size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-1.5 hover:bg-slate-100 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200' : ''}`}
                >
                    <Type size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 hover:bg-slate-100 rounded ${editor.isActive('bulletList') ? 'bg-slate-200' : ''}`}
                >
                    <List size={16} />
                </button>
            </div>

            {/* Selection-based AI Actions Menu */}
            {editor && !editor.state.selection.empty && (
                <div className="fixed z-50 flex gap-1 bg-slate-900 text-white rounded-lg shadow-xl p-1 border border-slate-700"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -120%)'
                    }}>
                    <button
                        onClick={() => handleAIAction('beautify')}
                        className="flex items-center gap-1 px-3 py-1.5 hover:bg-indigo-600 rounded text-sm font-medium transition"
                    >
                        <Sparkles size={14} /> Beautify
                    </button>
                    <button
                        onClick={() => handleAIAction('extract-tasks')}
                        className="flex items-center gap-1 px-3 py-1.5 hover:bg-green-600 rounded text-sm font-medium transition"
                    >
                        <ListChecks size={14} /> Extract Tasks
                    </button>
                </div>
            )}

            <EditorContent editor={editor} />
        </div>
    );
}