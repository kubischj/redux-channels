export default function channelManager() {
	let channels = {};

	function channel(name, dispatcher) {
		let listeners = [];

		function unsubscribe(index) {
			return listeners.splice(index, 1);
		}

		function subscribe(listener) {
			listeners.push(listener);
			return () => {
				return unsubscribe(listeners.length - 1);
			};
		}

		function dispatch(data) {
			return dispatcher(Object.assign({ type: name }, data));
		}

		function emit(data) {
			listeners.map((listener) => {
				setTimeout(() => {
					listener(data);
				}, 0);
			});
		}

		return { subscribe, dispatch, emit };
	}

	function createChannel(name, dispatcher) {
		if (!channels[name]) channels[name] = channel(name, dispatcher);
		return { subscribe: channels[name].subscribe, dispatch: channels[name].dispatch };
	}

	function reducer(initialState) {
		return (state = initialState, action) => {
			if (channels[action.type]) {
				return channels[action.type].emit(state);
			}
		}
	}

	return { createChannel, reducer };
}
