import { Component, ElementRef, ViewChild, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-rich-text-editor',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="editor-container" [class.focused]="isFocused">
      <div class="toolbar">
        <button type="button" (click)="exec('bold')" title="Gras"><b>B</b></button>
        <button type="button" (click)="exec('italic')" title="Italique"><i>I</i></button>
        <button type="button" (click)="exec('underline')" title="Souligné"><u>U</u></button>
        <div class="divider"></div>
        <button type="button" (click)="exec('insertUnorderedList')" title="Liste">list</button>
        <div class="divider"></div>
        <div class="emoji-trigger">
          <button type="button" (click)="toggleEmojiPicker()" title="Émojis">😊</button>
          <div class="emoji-picker" *ngIf="showEmojiPicker">
            <span *ngFor="let emoji of romanticEmojis" (click)="insertEmoji(emoji)">{{ emoji }}</span>
          </div>
        </div>
      </div>
      
      <div 
        #editor
        contenteditable="true"
        class="editor-content"
        (input)="onInput()"
        (focus)="isFocused = true"
        (blur)="onBlur()"
        placeholder="Écrivez votre secret ici..."
      ></div>
    </div>
  `,
    styles: [`
    .editor-container {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      
      &.focused {
        border-color: rgba(255, 0, 85, 0.5);
        box-shadow: 0 0 30px rgba(255, 0, 85, 0.15);
        background: rgba(255, 255, 255, 0.05);
      }
    }

    .toolbar {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      align-items: center;

      button {
        background: transparent;
        border: none;
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-size: 1.1rem;
        opacity: 0.7;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          opacity: 1;
        }
      }

      .divider {
        width: 1px;
        height: 20px;
        background: rgba(255, 255, 255, 0.1);
        margin: 0 0.5rem;
      }
    }

    .editor-content {
      min-height: 250px;
      padding: 1.5rem;
      color: white;
      font-size: 1.1rem;
      line-height: 1.6;
      outline: none;

      &:empty:before {
        content: attr(placeholder);
        color: rgba(255, 255, 255, 0.2);
        pointer-events: none;
      }
    }

    .emoji-trigger {
      position: relative;
    }

    .emoji-picker {
      position: absolute;
      top: 100%;
      left: 0;
      background: rgba(30, 10, 30, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.8rem;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.5rem;
      z-index: 100;
      width: 240px;
      margin-top: 0.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

      span {
        font-size: 1.5rem;
        cursor: pointer;
        transition: transform 0.2s;
        text-align: center;
        &:hover { transform: scale(1.2); }
      }
    }
  `],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RichTextEditorComponent),
            multi: true
        }
    ]
})
export class RichTextEditorComponent implements ControlValueAccessor {
    @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;

    isFocused = false;
    showEmojiPicker = false;

    romanticEmojis = [
        '❤️', '💖', '💝', '💗', '💓', '💕', '💘', '🌹', '✨', '💎',
        '😍', '🥰', '😘', '💍', '🥂', '💌', '🧸', '🌕', '🔥', '🌸',
        '🕊️', '🤝', '🦋', '🎈'
    ];

    onChange: any = () => { };
    onTouched: any = () => { };

    exec(command: string): void {
        document.execCommand(command, false);
        this.onInput();
    }

    toggleEmojiPicker(): void {
        this.showEmojiPicker = !this.showEmojiPicker;
    }

    insertEmoji(emoji: string): void {
        this.editor.nativeElement.focus();
        document.execCommand('insertText', false, emoji);
        this.showEmojiPicker = false;
        this.onInput();
    }

    onInput(): void {
        this.onChange(this.editor.nativeElement.innerHTML);
    }

    onBlur(): void {
        this.isFocused = false;
        this.onTouched();
    }

    writeValue(value: string): void {
        if (this.editor) {
            this.editor.nativeElement.innerHTML = value || '';
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
