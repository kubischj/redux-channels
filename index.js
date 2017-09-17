/**
 * Creates a channel manager.
 * @returns {{attach: attach, createChannel: createChannel, reducer, channels}}
 */
export default function channelManager() {
	let channels = {};

	/**
	 * Applies some of a functions' arguments to it without calling it, and returns the resulting function.
	 * @param fn
	 * @param args
	 * @returns {function(...[*])}
	 */
	function partialApply(fn = () => {}, ...args) {
		return (...moreArgs) => {
			return fn(...args, ...moreArgs);
		}
	}

	/**
	 * Creates a channel.
	 * @param dispatcher
	 * @param name
	 * @returns {{subscribe: subscribe, dispatch: (function(...[*])), emit: (function(...[*]))}}
	 */
	function channel(dispatcher, name) {
		let listeners = [];

		/**
		 * Removes a reducer by index from the channel.
		 * @param index
		 * @returns {Array.<*>}
		 */
		function unsubscribe(index) {
			return listeners.splice(index, 1);
		}

		/**
		 * Adds a reducer function to the channel.
		 * @param listener
		 * @returns {function(...[*])} Returns a function that can remove the added reducer from the channel.
		 */
		function subscribe(listener = () => {}) {
			listeners.push(listener);
			return partialApply(unsubscribe, listeners.length - 1);
		}

		/**
		 * Uses the dispatcher supplied when creating the channel to dispatch an action on the store, and fills the
		 * action type in with the channel name.
		 * @param name
		 * @param dispatcher
		 * @param data
		 * @returns {*}
		 */
		function dispatch(name, dispatcher = () => {}, data = {}) {
			if (!name.toUpperCase) {
				throw new Error(`You need to supply a string 'name' to the channel before calling dispatch on it.
				This should be the name of the variable holding the channel.`);
			}
			return dispatcher(Object.assign({}, data, { type: name }));
		}

		/**
		 * Sends the data to all the listeners.
		 * @param listeners
		 * @param data
		 */
		function emit(listeners = [], data) {
			listeners.map((listener) => {
				setTimeout(() => {
					listener(data);
				}, 0);
			});
		}

		return { subscribe, dispatch: partialApply(dispatch, name, dispatcher), emit: partialApply(emit, listeners) };
	}

	/**
	 * Creates a new channel, that uses the supplied dispatcher, and will be accessible by the supplied name, and adds
	 * it to the managers channels.
	 * @param dispatcher
	 * @param name
	 * @returns {{subscribe: (subscribe|((listener: () => void) => Unsubscribe)|*), dispatch}}
	 */
	function createChannel(dispatcher, name) {
		if (!dispatcher.call || !name.toUpperCase) {
			throw new Error(`The createChannel function should be called with a dispatcher function and a string name.`);
		}
		if (!channels[name]) channels[name] = channel(dispatcher, name);
		return { subscribe: channels[name].subscribe, dispatch: channels[name].dispatch };
	}

	/**
	 * The reducer function that should be supplied to the store. It will route all the actions to their respective
	 * channels, so the subscribers may produce the new state.
	 * @param channels
	 * @param initialState
	 * @returns {function(*=, *)}
	 */
	function reducer(channels, initialState = {}) {
		return (state = initialState, action) => {
			if (channels[action.type]) {
				return channels[action.type].emit(state);
			}
		}
	}

	/**
	 * Creates a store by calling the supplied createStore function, and then attaches the manager to it.
	 * @param createStore
	 * @param initialState
	 * @returns {{channels, createChannel: (function(...[*])), store: *}}
	 */
	function attach(createStore, initialState) {
		if (!createStore.call) {
			throw new Error(`Attach cannot create the store without a createStore function.`);
		}
		const store = createStore(reducer(channels, initialState));
		return {
			channels,
			createChannel: partialApply(createChannel, store.dispatch),
			store
		};
	}

	return { attach, createChannel, reducer: partialApply(reducer, channels), channels };
}
