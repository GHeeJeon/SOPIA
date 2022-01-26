const path = window.require('path');
const fs = window.require('fs');
const vm = window.require('vm');
const { remote } = window.require('electron');
const { app } = remote;
import { RouteConfig } from './index';
import { BundlePackage } from '@/interface/bundle';

export interface BundleInfo {
	dir: string;
	pkg: BundlePackage;
	name: string;
	page?: string;
}

let ret: RouteConfig[] = [];
const basePath = path.resolve(app.getPath('userData'), 'bundles');

const dirs = fs.readdirSync(basePath);
if ( Array.isArray(dirs) ) {
	ret = dirs
	.map((dir) => {
		const p = path.resolve(basePath, dir);
		const pkgPath = path.resolve(p, 'package.json');
		const info: BundleInfo = {
			name: dir,
			dir: p,
			pkg: {} as BundlePackage,
		};

		if ( fs.existsSync(pkgPath) ) {
			info.pkg = JSON.parse(fs.readFileSync(pkgPath, { encoding: 'utf8' }));
		}
		return info;
	})
	.filter((info) => info.pkg && info.pkg.page)
	.map((info) => {
		return {
			name: info.name,
			path: path.join('/bundle/' + path.basename(info.dir)),
			icon: info.pkg.icon || 'mdi-tangram',
		};
	}) as RouteConfig[];
}

export default {
	name: 'Bundle',
	path: '/bundle/:bundle/',
	component: () => import('@/views/Bundle/Index.vue'),
	icon: 'mdi-puzzle',
	isMenu: true,
	childs: [
		{
			name: 'store',
			path: '/bundle/store',
			icon: 'mdi-basket',
		},
		...ret,
		{
			path: '',
			redirect: '/bundle/store/',
		},
	],
} as RouteConfig;
