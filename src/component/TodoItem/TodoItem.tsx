/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Todo } from '../../types/Todo';

interface Props {
  todo: Todo;
  isProcessing: boolean;
  onUpdate: (todo: Todo) => void;
  onDelete: (todoId: number) => void;
  onRename: (todo: Todo, newTitle: string) => void;
}

export const TodoItem: React.FC<Props> = ({
  todo,
  isProcessing,
  onUpdate,
  onDelete,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(todo.title);

  // ✅ Правильна типізація ref
  const editInputRef = useRef<HTMLInputElement>(null);

  // ✅ Синхронізація локального стейту з пропсами (якщо змінилось на сервері)
  useEffect(() => {
    setNewTitle(todo.title);
  }, [todo.title]);

  // ✅ Примусовий фокус. autoFocus іноді не спрацьовує в тестах при ререндері
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    // Захист від подвійного виклику (якщо Enter і Blur спрацювали одночасно)
    if (!isEditing) {
      return;
    }

    const trimmedTitle = newTitle.trim();

    // Якщо нічого не змінилося
    if (trimmedTitle === todo.title) {
      setIsEditing(false);
      return;
    }

    // Якщо пустий текст — видаляємо
    if (!trimmedTitle) {
      onDelete(todo.id);
      return;
    }

    // Зберігаємо та закриваємо
    onRename(todo, trimmedTitle);
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      // Відміна редагування
      setNewTitle(todo.title);
      setIsEditing(false);
    } else if (event.key === 'Enter') {
      // ✅ preventDefault важливий, щоб уникнути зайвих подій форми
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', {
        completed: todo.completed,
      })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={() => onUpdate(todo)}
        />
      </label>

      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Submit обробляється через handleKeyDown або onBlur
          }}
        >
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            ref={editInputRef}
            autoFocus // ✅ Допомагає браузеру зрозуміти намір одразу
          />
        </form>
      ) : (
        <span
          data-cy="TodoTitle"
          className="todo__title"
          onDoubleClick={() => {
            setIsEditing(true);
            setNewTitle(todo.title);
          }}
        >
          {todo.title}
        </span>
      )}

      {!isEditing && (
        <button
          type="button"
          className="todo__remove"
          data-cy="TodoDelete"
          onClick={() => onDelete(todo.id)}
        >
          ×
        </button>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active': isProcessing,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
