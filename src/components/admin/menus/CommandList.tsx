import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    Type, Heading1, Heading2, Heading3,
    List, ListOrdered, Quote, Image,
    BarChart, Cpu, Layout, Youtube
} from 'lucide-react';

export const CommandList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
                return true;
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % props.items.length);
                return true;
            }
            if (event.key === 'Enter') {
                selectItem(selectedIndex);
                return true;
            }
            return false;
        },
    }));

    return (
        <div className="flex flex-col p-1 w-64 bg-paper border border-ink/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 dark:bg-neutral-900 dark:border-neutral-800">
            {props.items.length ? (
                props.items.map((item: any, index: number) => (
                    <button
                        key={index}
                        onClick={() => selectItem(index)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm text-left w-full rounded-md transition-colors ${index === selectedIndex
                                ? 'bg-ink/5 text-ink dark:bg-neutral-800 dark:text-neutral-100'
                                : 'text-ink/60 hover:bg-ink/5 dark:text-neutral-400 dark:hover:bg-neutral-800'
                            }`}
                    >
                        {item.icon && <item.icon className="w-4 h-4 opacity-70" />}
                        <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            {/* <span className="text-xs opacity-50">{item.description}</span> */}
                        </div>
                    </button>
                ))
            ) : (
                <div className="px-3 py-2 text-sm text-ink/40">No result</div>
            )}
        </div>
    );
});

CommandList.displayName = 'CommandList'; // Required for forwardRef
