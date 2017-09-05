# redux-channels

The aim is to create a wrapper for Redux stores to handle action types both when dispatching actions, and in the reducer functions instead of the user.

The name of the channel would be the type passed along to the store on a dispatch, and the manager would select and call the matching channels subscribers to handle state change.

```javascript
const { createStore } = Redux;
const initialState = { data: "🐈" };
const manager = channelManager();
const store = createStore(manager.reducer(initialState));
const myChannel = manager.createChannel("myChannel", store.dispatch);
```

Dispatches would be on channels:
```javascript
myChannel.dispatch(data);
```

Then, the channels subscribers are called to produce the new state, matching the action.type is not needed:
```javascript
let unsub = myChannel.subscribe(state => {
    // Change the state here
});
```

### To do:
* Handling incorrect parameters
* Test current implementation
* Write tests
* Finish the example
* Document code, and also update the readme
* Probably refactor
* Release to NPM

## Licence
MIT
