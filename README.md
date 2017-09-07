# redux-channels

The aim is to create a wrapper for Redux stores to handle action types both when dispatching actions, and in the reducer functions instead of the user.

The name of the channel would be the type passed along to the store on a dispatch, and the manager would select and call the matching channels subscribers to handle state change.

### Creating the manager, and a channel

#### The easier way

```javascript
const { createStore } = Redux;
const initialState = { data: "🐈" };
const manager = channelManager().attach(createStore, initialState);
// manager.store: The created store, reducer included
// manager.createChannel: The createChannel function, that only needs a channel name.

const myChannel = manager.createChannel("myChannel");
```

The manager will contain the store and the createChannel function, and you do not have to supply the stores' dispatch function as an argument to createChannel when using it, only a name.

#### The manual way

```javascript
const { createStore } = Redux;
const initialState = { data: "🐈" };
const manager = channelManager();
const store = createStore(manager.reducer(initialState));
const myChannel = manager.createChannel(store.dispatch, "myChannel");
```

### Using the channels

Dispatches would be on channels:
```javascript
myChannel.dispatch(data);
```

Then, the channels subscribers are called to produce the new state:
```javascript
let unsub = myChannel.subscribe(state => {
    // Change the state here
});
```

Action types do not need to be checked inside the subscribed function, as it will only be called, when a dispatch is called on its' own channel.

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
