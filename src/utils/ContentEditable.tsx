import * as React from 'react';
import deepEqual from 'fast-deep-equal';

/* 
 * Stole this code originally from 
 * https://github.com/lovasoa/react-contenteditable/blob/master/src/react-contenteditable.tsx
 * Modified to select items after content is editable
 */
function normalizeHtml(str: string): string {
    return str && str.replace(/&nbsp;|\u202F|\u00A0/g, ' ').replace(/<br \/>/g, '<br>');
}

function replaceCaret(el: HTMLElement) {
    // Place the caret at the end of the element
    const target = document.createTextNode('');
    el.appendChild(target);
    // do not move caret if element was not focused
    const isTargetFocused = document.activeElement === el;
    if (target !== null && target.nodeValue !== null && isTargetFocused) {
        var sel = window.getSelection();
        if (sel !== null) {
            var range = document.createRange();
            range.setStart(target, target.nodeValue.length);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        if (el instanceof HTMLElement) el.focus();
    }
}

/**
 * A simple component for an html element with editable contents.
 */
export default class ContentEditable extends React.Component<Props> {
    lastHtml: string = this.props.html;
    el: any = typeof this.props.innerRef === 'function' ? { current: null } : React.createRef<HTMLElement>();

    getEl = () => (this.props.innerRef && typeof this.props.innerRef !== 'function' ? this.props.innerRef : this.el).current;

    render() {
        const { tagName, html, innerRef, ...props } = this.props;
        return React.createElement(
            tagName || 'div',
            {
                ...props,
                ref: typeof innerRef === 'function' ? (current: HTMLElement) => {
                    innerRef(current)
                    this.el.current = current
                } : innerRef || this.el,
                onInput: this.emitChange,
                onFocus: this.props.onFocus || this.emitChange,
                onBlur: this.props.onBlur || this.emitChange,
                onClick: this.props.onClick || this.emitChange,
                onKeyUp: this.props.onKeyUp || this.emitChange,
                onKeyDown: this.props.onKeyDown || this.emitChange,
                contentEditable: !this.props.disabled,
                dangerouslySetInnerHTML: { __html: html }
            },
            this.props.children);
    }

    shouldComponentUpdate(nextProps: Props): boolean {
        const { props } = this;
        const el = this.getEl();

        // We need not rerender if the change of props simply reflects the user's edits.
        // Rerendering in this case would make the cursor/caret jump

        // Rerender if there is no element yet... (somehow?)
        if (!el) return true;

        // ...or if html really changed... (programmatically, not by user edit)
        if (
            normalizeHtml(nextProps.html) !== normalizeHtml(el.innerHTML)
        ) {
            return true;
        }
        // Handle additional properties
        // NOTE: This is a modification to the original as it did not check if onFocus/onBlur 
        // where modified
        return props.disabled !== nextProps.disabled ||
            props.tagName !== nextProps.tagName ||
            props.onClick !== nextProps.onClick ||
            props.onFocus !== nextProps.onFocus ||
            props.onBlur != nextProps.onBlur ||
            props.className !== nextProps.className ||
            props.innerRef !== nextProps.innerRef ||
            props.placeholder !== nextProps.placeholder ||
            !deepEqual(props.style, nextProps.style);
    }

    componentDidUpdate(previousProps: Props) {
        const el = this.getEl();
        if (!el) return;

        // Perhaps React (whose VDOM gets outdated because we often prevent
        // rerendering) did not update the DOM. So we update it manually now.
        if (this.props.html !== el.innerHTML) {
            el.innerHTML = this.props.html;
        }
        this.lastHtml = this.props.html;
        replaceCaret(el);
        if (previousProps.disabled && !this.props.disabled) {
            el.focus();
            var range = document.createRange();
            range.selectNodeContents(el);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }

    emitChange = (originalEvt: React.SyntheticEvent<any>) => {
        const el = this.getEl();
        if (!el) return;

        const html = el.innerHTML;
        if (this.props.onChange && html !== this.lastHtml) {
            // Clone event with Object.assign to avoid
            // "Cannot assign to read only property 'target' of object"
            const evt = Object.assign({}, originalEvt, {
                target: {
                    value: html
                }
            });
            this.props.onChange(evt);
        }
        this.lastHtml = html;
    }
}

export type ContentEditableEvent = React.SyntheticEvent<any, Event> & { target: { value: string } };
type Modify<T, R> = Pick<T, Exclude<keyof T, keyof R>> & R;
type DivProps = Modify<React.JSX.IntrinsicElements["div"], { onChange: ((event: ContentEditableEvent) => void) }>;

export interface Props extends DivProps {
    html: string,
    disabled?: boolean,
    tagName?: string,
    className?: string,
    style?: Object,
    innerRef?: React.RefObject<HTMLElement> | Function,
    placeholder?: string
}