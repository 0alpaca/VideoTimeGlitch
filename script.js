document.getElementById('processButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const minutes = document.getElementById('minutes').value;
    const seconds = document.getElementById('seconds').value;

    if (fileInput.files.length === 0) {
        alert('ファイルを選択してください。');
        return;
    }

    if (minutes === "" || seconds === "") {
        alert('時間を正しく入力してください。');
        return;
    }

    const file = fileInput.files[0];
    const durationInMilliseconds = (parseInt(minutes) * 60 + parseInt(seconds)) * 1000;
    const durationInDouble = new DataView(new ArrayBuffer(8));
    durationInDouble.setFloat64(0, durationInMilliseconds, false);
    const replacementBytes = new Uint8Array(durationInDouble.buffer);

    const arrayBuffer = await file.arrayBuffer();
    const webmData = new Uint8Array(arrayBuffer);

    const targetSequence = [0x2a, 0xb7, 0xb1, 0x44, 0x89, 0x88];
    const index = findSequenceIndex(webmData, targetSequence);
    if (index === -1) {
        alert('指定されたシーケンスが見つかりませんでした。');
        return;
    }

    for (let i = 0; i < 8; i++) {
        webmData[index + targetSequence.length + 1 + i] = replacementBytes[i];
    }

    const blob = new Blob([webmData], { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified_video.webm';
    a.click();
    URL.revokeObjectURL(url);
});

function findSequenceIndex(data, sequence) {
    for (let i = 0; i < data.length - sequence.length; i++) {
        let match = true;
        for (let j = 0; j < sequence.length; j++) {
            if (data[i + j] !== sequence[j]) {
                match = false;
                break;
            }
        }
        if (match) {
            return i;
        }
    }
    return -1;
}
