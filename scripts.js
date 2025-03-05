document.getElementById('processButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('videoFile');
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    const fileError = document.getElementById('fileError');
    const timeError = document.getElementById('timeError');
    const downloadLinks = document.getElementById('downloadLinks');

    fileError.textContent = '';
    timeError.textContent = '';

    if (fileInput.files.length === 0) {
        fileError.textContent = '動画ファイルを選択してください。';
        return;
    }

    if (seconds >= 60) {
        timeError.textContent = '秒数は0から59の間で指定してください。';
        return;
    }

    const duration = (minutes * 60 + seconds) * 1000;
    if (duration > Number.MAX_SAFE_INTEGER) {
        timeError.textContent = '数が大きすぎます。';
        return;
    }

    const file = fileInput.files[0];
    const durationBuffer = new ArrayBuffer(8);
    const durationView = new DataView(durationBuffer);
    durationView.setFloat64(0, duration, false);

    const arrayBuffer = await file.arrayBuffer();
    const byteArray = new Uint8Array(arrayBuffer);

    // Convert durationBuffer to byte array
    const newDurationArray = new Uint8Array(durationBuffer);

    // Find the pattern 448988 in the byte array
    const pattern = [0x44, 0x89, 0x88];
    let position = -1;
    for (let i = 0; i < byteArray.length - pattern.length; i++) {
        if (byteArray.slice(i, i + pattern.length).every((val, idx) => val === pattern[idx])) {
            position = i + pattern.length;
            break;
        }
    }

    if (position !== -1) {
        // Replace the 8 bytes after 448988 with the new duration
        for (let i = 0; i < 8; i++) {
            byteArray[position + i] = newDurationArray[i];
        }

        const blob = new Blob([byteArray], { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        const downloadText = `ダウンロード (${file.name} ${minutes}分${seconds}秒)`;

        // Check if a similar download link already exists
        const existingLinks = Array.from(downloadLinks.getElementsByTagName('a'));
        if (!existingLinks.some(link => link.textContent === downloadText)) {
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'modified_video.webm';
            downloadLink.textContent = downloadText;
            downloadLinks.insertBefore(downloadLink, downloadLinks.firstChild);
            downloadLinks.insertBefore(document.createElement('br'), downloadLinks.firstChild);
        }
    } else {
        alert('指定されたパターンが見つかりませんでした。');
    }
});

document.getElementById('videoFile').addEventListener('change', () => {
    document.getElementById('fileError').textContent = '';
    document.getElementById('timeError').textContent = '';
});

document.getElementById('maxDurationButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('videoFile');
    const fileError = document.getElementById('fileError');
    const downloadLinks = document.getElementById('downloadLinks');

    fileError.textContent = '';

    if (fileInput.files.length === 0) {
        fileError.textContent = '動画ファイルを選択してください。';
        return;
    }

    const file = fileInput.files[0];
    const arrayBuffer = await file.arrayBuffer();
    const byteArray = new Uint8Array(arrayBuffer);

    // The fixed duration byte array (000001000000)
    const fixedDurationArray = new Uint8Array([0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00]);

    // Find the pattern 448988 in the byte array
    const pattern = [0x44, 0x89, 0x88];
    let position = -1;
    for (let i = 0; i < byteArray.length - pattern.length; i++) {
        if (byteArray.slice(i, i + pattern.length).every((val, idx) => val === pattern[idx])) {
            position = i + pattern.length;
            break;
        }
    }

    if (position !== -1) {
        // Replace the 8 bytes after 448988 with the fixed duration
        for (let i = 0; i < 8; i++) {
            byteArray[position + i] = fixedDurationArray[i];
        }

        const blob = new Blob([byteArray], { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        const downloadText = `ダウンロード (${file.name} 最大再生時間変動)`;

        // Check if a similar download link already exists
        const existingLinks = Array.from(downloadLinks.getElementsByTagName('a'));
        if (!existingLinks.some(link => link.textContent === downloadText)) {
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'modified_video_max_duration.webm';
            downloadLink.textContent = downloadText;
            downloadLinks.insertBefore(downloadLink, downloadLinks.firstChild);
            downloadLinks.insertBefore(document.createElement('br'), downloadLinks.firstChild);
        }
    } else {
        alert('指定されたパターンが見つかりませんでした。');
    }
});

function checkInputs() {
    const secondsInput = document.getElementById('seconds');
    const processButton = document.getElementById('processButton');
    const timeError = document.getElementById('timeError');
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    const duration = (minutes * 60 + seconds) * 1000;

    if (seconds >= 60) {
        timeError.textContent = '秒は0から59の間で指定してください。';
        processButton.disabled = true;
    } else if (duration > Number.MAX_SAFE_INTEGER) {
        timeError.textContent = '数字が大きすぎます。';
        processButton.disabled = true;
    } else {
        timeError.textContent = '';
        processButton.disabled = false;
    }
}
