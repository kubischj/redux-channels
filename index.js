/**
 *
 * @returns {{attach: attach, createChannel: createChannel, reducer}}
 */
export default function channelManager() {
	let channels = {};

	/**
	 *
	 * @param fn
	 * @param args
	 * @returns {function(...[*])}
	 */
	function curry(fn, ...args) {
		return (...moreArgs) => {
			return fn(...args, ...moreArgs);
		}
	}

	/**
	 *
	 * @param dispatcher
	 * @param name
	 * @returns {{subscribe: subscribe, dispatch: (function(...[*])), emit: (function(...[*]))}}
	 */
	function channel(dispatcher, name) {
		let listeners = [];

		/**
		 *
		 * @param index
		 * @returns {Array.<*>}
		 */
		function unsubscribe(index) {
			return listeners.splice(index, 1);
		}

		/**
		 *
		 * @param listener
		 * @returns {function(...[*])}
		 */
		function subscribe(listener) {
			listeners.push(listener);
			return curry(unsubscribe, listeners.length - 1);
		}

		/**
		 *
		 * @param dispatcher
		 * @param data
		 * @returns {*}
		 */
		function dispatch(dispatcher, data = {}) {
			return dispatcher(Object.assign({}, data, { type: name }));
		}

		/**
		 *
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

		return { subscribe, dispatch: curry(dispatch, dispatcher), emit: curry(emit, listeners) };
	}

	/**
	 *
	 * @param dispatcher
	 * @param name
	 * @returns {{subscribe: (subscribe|((listener: () => void) => Unsubscribe)|*), dispatch}}
	 */
	function createChannel(dispatcher, name) {
		if (!channels[name]) channels[name] = channel(dispatcher, name);
		return { subscribe: channels[name].subscribe, dispatch: channels[name].dispatch };
	}

	/**
	 *
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
	 *
	 * @param createStore
	 * @param initialState
	 * @returns {{createChannel: (function(...[*])), store: *}}
	 */
	function attach(createStore, initialState) {
		const store = createStore(reducer(channels, initialState));
		return {
			createChannel: curry(createChannel, store.dispatch),
			store
		};
	}

	return { attach, createChannel, reducer: curry(reducer, channels) };
}
