import React from 'react';
import Layout from './HUD/Layout/Layout';
import api, { port, isDev } from './api/api';
import { loadAvatarURL } from './api/avatars';
import ActionManager, { ConfigManager } from './api/actionManager';

import { CSGO, PlayerExtension, GSISocket } from "csgogsi-socket";
import { Match } from './api/interfaces';

export const { GSI, socket } = GSISocket(isDev ? `localhost:${port}` : '/', "update");

export const actions = new ActionManager();
export const configs = new ConfigManager();

export const hudIdentity = {
	name: '',
	isDev: false
};

interface DataLoader {
	match: Promise<void> | null
}

const dataLoader: DataLoader = {
	match: null
}

class App extends React.Component<any, { match: Match | null, game: CSGO | null, steamids: string[], checked: boolean }> {
	constructor(props: any) {
		super(props);
		this.state = {
			game: null,
			steamids: [],
			match: null,
			checked: false
		}
	}


	componentDidMount() {
		const href = window.location.href;
		socket.emit("started");
		let isDev = false;
		let name = '';
		if (href.indexOf('/huds/') === -1) {
			isDev = true;
			name = (Math.random() * 1000 + 1).toString(36).replace(/[^a-z]+/g, '').substr(0, 15);
			hudIdentity.isDev = true;
		} else {
			const segment = href.substr(href.indexOf('/huds/') + 6);
			name = segment.substr(0, segment.lastIndexOf('/'));
			hudIdentity.name = name;
		}

		socket.on("readyToRegister", () => {
			socket.emit("register", name, isDev);
		});
		socket.on(`hud_config`, (data: any) => {
			console.log(data);
			configs.save(data);
		});
		socket.on(`hud_action`, (data: any) => {
			actions.execute(data.action, data.data);
		});
		socket.on('keybindAction', (action: string) => {
			actions.execute(action);
		});

		socket.on("refreshHUD", () => {
			window.top.location.reload();
		});

		socket.on("update_mirv", (data: any) => {
			GSI.digestMIRV(data);
		})

	}

	
	render() {
		return (
			<Layout />
		);
	}

}
export default App;
