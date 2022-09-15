import { React, useReducer, useEffect } from "react";
import axios from "axios";

import LoadingSpinner from "./LoadingSpinner";

import "./App.css";

const jobsReducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        jobs: [...state.jobs, action.job],
        isLoading: true,
        isTouched: true,
      };

    case "SHIFT":
      const next = state.jobs;
      next.shift();
      const loading = next.length === 0 ? false : state.isLoading;
      return {
        ...state,
        isLoading: loading,
        jobs: next,
        email: action.email,
        isValid: action.validity,
      };

    case "EMPTY":
      return { ...state, jobs: [], isLoading: false };

    case "TOUCH": {
      return {
        ...state,
        isTouched: true,
      };
    }

    default:
      return state;
  }
};

const isExecutingTaskReducer = (status, action) => {
  return action;
};

function App() {
  const [jobs, dispatch] = useReducer(jobsReducer, {
    jobs: [],
    email: "",
    isValid: false,
    isLoading: false,
    isTouched: false,
  });
  const [isExecutingTask, setIsExecutingTask] = useReducer(
    isExecutingTaskReducer,
    false
  );

  useEffect(() => {
    const func = async () => {
      if (jobs.jobs.length > 0 && !isExecutingTask) {
        setIsExecutingTask(true);
        const job = jobs.jobs[0];
        try {
          await job().then((res) => {
            dispatch({
              type: "SHIFT",
              email: res.data.email,
              validity: res.data.validation_status,
            });
          });
        } catch (err) {
          dispatch({ type: "SHIFT", validity: false });
        }

        setIsExecutingTask(false);
      }
    };

    func();
  }, [jobs.jobs, isExecutingTask, setIsExecutingTask]);

  const addJob = async (job) => {
    dispatch({ type: "ADD", job });
  };

  const handleEmail = (e) => {
    addJob(
      async () =>
        await axios.get(`/api/email-validator.php?email=${e.target.value}`)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`email: ${jobs.email}`);
  };

  const touchHandler = () => {
    dispatch({
      type: "TOUCH",
    });
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        {jobs.isLoading && <LoadingSpinner />}
        <label>email:</label>
        <input
          className={`${jobs.isTouched && !jobs.isValid && "input--invalid"}`}
          type="text"
          onBlur={touchHandler}
          onChange={handleEmail}
        />
        {jobs.isTouched && !jobs.isValid && (
          <p>Please input valid email adress!</p>
        )}
        <button disabled={!jobs.isValid}>Submit</button>
      </form>
    </div>
  );
}

export default App;
