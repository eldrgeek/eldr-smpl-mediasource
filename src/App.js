import React from "react";
import "./styles.css";

export default function App() {
  const fun = async () => {
    const promiseA = new Promise((resolutionFunc, rejectionFunc) => {
      resolutionFunc(777);
    });
    // At this point, "promiseA" is already settled.
    promiseA.then(val => console.log("asynchronous logging has val:", val));
    console.log("immediate logging");
    console.log("fun");
    const resolve = a => a;
    const promise = new Promise(resolve => resolve("this is resolved"));
    console.log("original", promise);
    promise.then(p => console.log("promise ", p));
    resolve(14);
    promise.then(p => console.log("first ", p));
    const promise2 = Promise.resolve(promise);
    const promise3 = Promise.resolve(promise2);
    promise2.then(result => console.log("promise2 ", result));
    promise3.then(result => console.log("promise3 ", typeof result));
    const value = await promise3;
    console.log("value is ", value);
    resolve(14);
  };
  // fun();
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
