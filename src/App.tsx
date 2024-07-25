import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
      error: (err) => setError(`Error fetching todos: ${err.message}`),
    });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content })
        .catch(err => setError(`Error creating todo: ${err.message}`));
    }
  }
    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
      .catch(err => setError(`Error deleting todo: ${err.message}`));
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId ? `${user.signInDetails.loginId}'s todos` : 'My todos'}</h1>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button onClick={createTodo}>+ new</button>
          <ul>
            {todos.map((todo) => (
              <li
                onClick={() => deleteTodo(todo.id)}
                key={todo.id}
                role="button"
                aria-label={`Delete ${todo.content}`}
              >
                {todo.content}
              </li>
            ))}
          </ul>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
              Review the next step of this tutorial.
            </a>
          </div>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}

export default App;
