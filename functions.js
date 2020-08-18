window.onload = () => {

    $('#audioDesktop').change(function () {
        $('#tipAudio').toggleClass('d-none', this.checked == false);
    });

    const videoElement = document.getElementById('preview');
    const captureBtn = document.getElementById('startCapture');
    const startBtn = document.getElementById('startRecord');
    const stopBtn = document.getElementById('stopRecord');
    const download = document.getElementById('download');
    const audioToggle = document.getElementById('audioDesktop');
    const micAudioToggle = document.getElementById('audioMic');

    if (!('getDisplayMedia' in navigator.mediaDevices))
        $('#erro').removeClass('d-none');

    let blobs;
    let blob;
    let rec;
    let stream;
    let voiceStream;
    let desktopStream;

    const mergeAudioStreams = (desktopStream, voiceStream) => {
        const context = new AudioContext();
        const destination = context.createMediaStreamDestination();
        let hasDesktop = false;
        let hasVoice = false;
        if (desktopStream && desktopStream.getAudioTracks().length > 0) {
            const source1 = context.createMediaStreamSource(desktopStream);
            const desktopGain = context.createGain();
            desktopGain.gain.value = 0.7;
            source1.connect(desktopGain).connect(destination);
            hasDesktop = true;
        }

        if (voiceStream && voiceStream.getAudioTracks().length > 0) {
            const source2 = context.createMediaStreamSource(voiceStream);
            const voiceGain = context.createGain();
            voiceGain.gain.value = 0.7;
            source2.connect(voiceGain).connect(destination);
            hasVoice = true;
        }

        return (hasDesktop || hasVoice) ? destination.stream.getAudioTracks() : [];
    };

    captureBtn.onclick = async () => {
        download.removeAttribute('href');
        $(download).addClass('disabled');

        const audio = audioToggle.checked || false;
        const mic = micAudioToggle.checked || false;

        desktopStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: audio });

        if (mic === true) {
            voiceStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: mic });
        }

        const tracks = [
            ...desktopStream.getVideoTracks(),
            ...mergeAudioStreams(desktopStream, voiceStream)
        ];

        stream = new MediaStream(tracks);
        videoElement.srcObject = stream;
        videoElement.muted = true;
        videoElement.controls = false;
        videoElement.autoplay = true;
        videoElement.poster = '';
        blobs = [];

        rec = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8,opus' });
        rec.ondataavailable = (e) => blobs.push(e.data);
        rec.onstop = async () => {

            blob = new Blob(blobs, { type: 'video/webm' });
            let url = window.URL.createObjectURL(blob);
            download.href = url;
            download.download = 'gravacao.webm';
            $(download).removeClass('disabled');

            videoElement.src = url;
            videoElement.muted = false;
            videoElement.controls = true;
            videoElement.autoplay = false;
        };
        startBtn.disabled = false;
        captureBtn.disabled = true;
        audioToggle.disabled = true;
        micAudioToggle.disabled = true;
    };

    startBtn.onclick = () => {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        rec.start();
    };

    stopBtn.onclick = () => {
        captureBtn.disabled = false;
        audioToggle.disabled = false;
        micAudioToggle.disabled = false;
        startBtn.disabled = true;
        stopBtn.disabled = true;

        rec.stop();

        stream.getTracks().forEach(s => s.stop())
        videoElement.srcObject = null
        stream = null;
    };

    $(".popup").click(function (e) {
        e.preventDefault();

        var w = 854, h = 480;
        var a = $(this);

        var left = (screen.width / 2) - (w / 2);
        const newWindow = window.open(a.attr('href') + '#' + w + 'x' + h, a.attr('target'), 'location=no,menubar=no,resizable=no,scrollbars=no,status=no,titlebar=no,toolbar=no,width=' + w + ',height=' + h + ',top=20,left=' + left)
        if (window.focus)
            newWindow.focus();
        else
            $('#bloqueadorpopup').removeClass('d-none');

        return false;
    });

};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('sw.js');
}
