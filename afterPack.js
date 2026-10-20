import { execFileSync, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Stamps icon + version resources onto the Windows exe. electron-builder's own
// signAndEditResources path (signAndEditExecutable=true) needs the winCodeSign
// tool archive, which fails to extract on machines without symlink privilege,
// so we call app-builder's built-in rcedit directly instead.
function stampWindowsExe(exePath, packager) {
    const archDir = process.arch === 'arm64' ? 'arm64' : process.arch === 'ia32' ? 'ia32' : 'x64';
    const appBuilder = path.join('node_modules', 'app-builder-bin', 'win', archDir, 'app-builder.exe');
    const iconOut = path.resolve('release', '.icon-ico');
    fs.mkdirSync(iconOut, { recursive: true });

    let iconPath = path.join(iconOut, 'icon.ico');
    if (!fs.existsSync(iconPath)) {
        execFileSync(appBuilder, ['icon', '--format', 'ico', '--root', '.', '--root', '.',
            '--out', iconOut, '--input', path.join('public', 'banner.png')], { stdio: 'pipe' });
    }

    const appInfo = packager.appInfo;
    const args = [
        exePath,
        '--set-version-string', 'FileDescription', appInfo.description || appInfo.productName,
        '--set-version-string', 'ProductName', appInfo.productName,
        '--set-version-string', 'LegalCopyright', appInfo.copyright || '',
        '--set-file-version', appInfo.shortVersion || appInfo.buildVersion,
        '--set-product-version', appInfo.shortVersionWindows || appInfo.getVersionInWeirdWindowsForm(),
        '--set-version-string', 'InternalName', path.basename(exePath, '.exe'),
        '--set-version-string', 'OriginalFilename', '',
    ];
    if (appInfo.companyName) {
        args.push('--set-version-string', 'CompanyName', appInfo.companyName);
    }
    args.push('--set-icon', iconPath);

    execFileSync(appBuilder, ['rcedit', '--args', JSON.stringify(args)], { stdio: 'inherit' });
    console.log(`  • stamped exe resources  path=${exePath}`);
}

export default async function afterPack({ appOutDir, packager }) {
    const platformName = packager.platform.name;

    // Remove Next.js SWC native binaries that don't belong on this target platform.
    // They are bundled because `next` is in dependencies, but only the host-platform
    // binary is ever used at runtime in the Electron app.
    const nextDir = path.join(appOutDir,
        platformName === 'mac'
            ? `${packager.appInfo.productName}.app/Contents/Resources`
            : 'resources',
        'app.asar.unpacked/node_modules/@next'
    );

    if (fs.existsSync(nextDir)) {
        const keepPrefix = platformName === 'mac' ? 'swc-darwin'
            : platformName === 'windows' ? 'swc-win32'
            : 'swc-linux';

        for (const entry of fs.readdirSync(nextDir)) {
            if (entry.startsWith('swc-') && !entry.startsWith(keepPrefix)) {
                const fullPath = path.join(nextDir, entry);
                fs.rmSync(fullPath, { recursive: true, force: true });
                console.log(`  • removed foreign SWC binary  path=${fullPath}`);
            }
        }
    }

    if (platformName === 'windows') {
        stampWindowsExe(path.join(appOutDir, `${packager.appInfo.productFilename}.exe`), packager);
        return;
    }

    if (platformName !== 'mac') return;

    const appPath = path.join(appOutDir, `${packager.appInfo.productName}.app`);
    console.log(`  • ad-hoc signing  path=${appPath}`);
    execSync(`codesign --deep --force --sign - "${appPath}"`, { stdio: 'inherit' });
    console.log(`  • ad-hoc signing complete`);
}
