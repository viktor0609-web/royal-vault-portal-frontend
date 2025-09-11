import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
}

export interface RichTextEditorRef {
    getEditor: () => any;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
    ({ value, onChange, placeholder, className, style }, ref) => {
        const quillRef = useRef<any>(null);

        useImperativeHandle(ref, () => ({
            getEditor: () => quillRef.current?.getEditor?.()
        }));

        return (
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={className}
                style={style}
                modules={{
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        [{ 'indent': '-1' }, { 'indent': '+1' }],
                        ['link'],
                        ['clean']
                    ],
                }}
            />
        );
    }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
