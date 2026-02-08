"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Suggestion from "@tiptap/suggestion";
import { Extension } from "@tiptap/core";
import { useEffect, useRef, useState } from "react";
import { Poppins } from "next/font/google";
import {
    Sparkles,
    CheckSquare,
    Bold,
    Italic,
    Loader2,
} from "lucide-react";

/* ---------------- Font ---------------- */

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
});

/* ---------------- Types ---------------- */

interface LiveTranscript {
    text: string;
    timestamp: number;
}

interface TiptapEditorProps {
    liveTranscript?: LiveTranscript | null;
    initialContent?: string;
    onUpdate?: (content: string) => void;
}

/* ---------------- Slash Commands ---------------- */

const COMMANDS = [
    {
        title: "Heading 1",
        description: "Big section heading",
        command: (editor: any) =>
            editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
        title: "Heading 2",
        description: "Medium section heading",
        command: (editor: any) =>
            editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
        title: "To-do List",
        description: "Checklist with boxes",
        command: (editor: any) =>
            editor.chain().focus().toggleTaskList().run(),
    },
    {
        title: "Bullet List",
        description: "Simple bullet list",
        command: (editor: any) =>
            editor.chain().focus().toggleBulletList().run(),
    },
    {
        title: "Numbered List",
        description: "Ordered list",
        command: (editor: any) =>
            editor.chain().focus().toggleOrderedList().run(),
    },
    {
        title: "Quote",
        description: "Quote block",
        command: (editor: any) =>
            editor.chain().focus().toggleBlockquote().run(),
    },
    {
        title: "Divider",
        description: "Horizontal line",
        command: (editor: any) =>
            editor.chain().focus().setHorizontalRule().run(),
    },
];

/* ---------------- Slash Command Extension ---------------- */

const SlashCommand = Extension.create({
    name: "slash-command",

    addOptions() {
        return {
            suggestion: {
                char: "/",
                startOfLine: true,
                items: ({ query }: any) =>
                    COMMANDS.filter((item) =>
                        item.title.toLowerCase().includes(query.toLowerCase())
                    ),
                command: ({ editor, range, props }: any) => {
                    editor.chain().focus().deleteRange(range).run();
                    props.command(editor);
                },
                render: () => {
                    let component: HTMLDivElement;

                    return {
                        onStart: (props: any) => {
                            component = document.createElement("div");
                            component.className =
                                "bg-white shadow-xl border rounded-lg p-1 w-72";

                            props.items.forEach((item: any) => {
                                const button = document.createElement("button");
                                button.className =
                                    "w-full text-left px-3 py-2 hover:bg-slate-100 rounded";
                                button.innerHTML = `
                  <div class="font-medium">${item.title}</div>
                  <div class="text-xs text-slate-500">${item.description}</div>
                `;
                                button.onclick = () => props.command(item);
                                component.appendChild(button);
                            });

                            document.body.appendChild(component);
                            const rect = props.clientRect();
                            component.style.position = "absolute";
                            component.style.left = rect.left + "px";
                            component.style.top = rect.bottom + 6 + "px";
                        },
                        onExit: () => {
                            component?.remove();
                        },
                    };
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

/* ---------------- Component ---------------- */

export default function TiptapEditor({
    liveTranscript,
    initialContent,
    onUpdate,
}: TiptapEditorProps) {
    const [isAiLoading, setIsAiLoading] = useState(false);
    const lastInsertedRef = useRef<number>(0);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({ nested: true }),
            HorizontalRule,
            SlashCommand,
            Placeholder.configure({
                placeholder: "Start typing or wait for transcription...",
                emptyEditorClass:
                    "is-editor-empty cursor-text before:content-[attr(data-placeholder)] before:text-slate-400 before:pointer-events-none",
            }),
        ],
        content: initialContent,
        onUpdate: ({ editor }) => onUpdate?.(editor.getHTML()),
        editorProps: {
            attributes: {
                class: `prose prose-lg max-w-none focus:outline-none min-h-[500px] ${poppins.className}`,
            },
        },
    });

    /* -------- Live transcription auto-insert -------- */

    useEffect(() => {
        if (!editor || !liveTranscript) return;

        if (liveTranscript.timestamp > lastInsertedRef.current) {
            lastInsertedRef.current = liveTranscript.timestamp;
            const endPos = editor.state.doc.content.size;
            editor.commands.insertContentAt(endPos, " " + liveTranscript.text);
            editor.view.dom.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [liveTranscript, editor]);

    /* -------- Two-finger tap → slash menu -------- */

    useEffect(() => {
        if (!editor) return;

        const handleTouch = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                editor.chain().focus().insertContent("/").run();
            }
        };

        const dom = editor.view.dom;
        dom.addEventListener("touchstart", handleTouch);
        return () => dom.removeEventListener("touchstart", handleTouch);
    }, [editor]);

    /* ---------------- AI Logic ---------------- */

    const handleAIAction = async (action: string) => {
        if (!editor) return;

        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        if (!text) return;

        setIsAiLoading(true);

        try {
            const token = localStorage.getItem("echo_token");
            const res = await fetch("/api/ai-format", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text, action }),
            });

            if (res.ok) {
                const data = await res.json();
                editor.chain().focus().insertContentAt({ from, to }, data.result).run();
            }
        } finally {
            setIsAiLoading(false);
        }
    };

    if (!editor) return null;

    return (
        <div className="relative max-w-4xl mx-auto pb-32">
            {/* Bubble Menu */}
            <BubbleMenu editor={editor} className="flex gap-1 bg-slate-900 p-2 rounded-full">
                <button onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold className="text-white" size={16} />
                </button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic className="text-white" size={16} />
                </button>

                <button
                    onClick={() => handleAIAction("beautify")}
                    disabled={isAiLoading}
                    className="flex items-center gap-1 text-indigo-300 ml-2"
                >
                    {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Fix
                </button>

                <button
                    onClick={() => handleAIAction("extract-tasks")}
                    disabled={isAiLoading}
                    className="flex items-center gap-1 text-emerald-300"
                >
                    {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckSquare size={14} />}
                    Task
                </button>
            </BubbleMenu>

            <EditorContent editor={editor} />

            <style jsx global>{`
        /* === Task List (Checkbox) Styling === */
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
          margin: 0.5em 0;
        }

        .ProseMirror li[data-type="taskItem"] {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin: 0.25em 0;
        }

        /* checkbox itself */
        .ProseMirror li[data-type="taskItem"] > label {
          display: flex;
          align-items: center;
          margin-top: 0.15em;
          user-select: none;
        }

        /* text content */
        .ProseMirror li[data-type="taskItem"] > div {
          flex: 1;
        }

        /* completed task */
        .ProseMirror li[data-type="taskItem"][data-checked="true"] > div {
          text-decoration: line-through;
          color: #94a3b8;
        }
      `}</style>
        </div>
    );
}
