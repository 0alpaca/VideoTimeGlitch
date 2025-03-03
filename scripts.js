document.getElementById('processButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('videoFile');
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;

    if (fileInput.files.length === 0) {
        alert('動画ファイルを選択してください。');
        return;
    }

    const file = fileInput.files[0];
    const duration = (minutes * 60 + seconds) * 1000;
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

        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.download = 'modified_video.webm';
        downloadLink.style.display = 'block';
        downloadLink.textContent = 'ダウンロード';
    } else {
        alert('指定されたパターンが見つかりませんでした。');
    }
});
