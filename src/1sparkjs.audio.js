((global) => {

     const OneSparkJs = {};

     //Audio module
     OneSparkJs.Audio = (() => {

          class Extension extends $1S.Application.ExtensionType {

               audioCache = new Map();
               activeAudios = new Set();

               constructor() {
                    super(0);
               }

               onLoad = (appPath, properties, oncomplete) => {
                    //does nothing for now
                    oncomplete()
               }

               playAudio = (name, loop = false, volume = 1) => {

                    const node = $1S.Assets.getAudio(name);
                    if (node == null) return;
                    const src = node.path;

                    const audioElement = this.getAudioElement(src);

                    if (this.activeAudios.has(audioElement)) {
                         // If the audio element is already active, restart it from the beginning
                         audioElement.currentTime = 0;
                    } else {
                         // Otherwise, add the audio element to the set of active audios
                         this.activeAudios.add(audioElement);
                    }

                    // Set the loop property if necessary
                    if (loop) {
                         audioElement.loop = true;
                    }

                    // Set the volume if necessary
                    if (volume !== 1) {
                         audioElement.volume = volume;
                    }

                    // Play the audio file
                    audioElement.play();
               };

               stopAudio = (name) => {

                    const node = $1S.Assets.getAudio(name);
                    if (node == null) return;
                    const src = node.path;

                    const audioElement = this.audioCache.get(src);
                    if (audioElement && this.activeAudios.has(audioElement)) {
                         audioElement.pause();
                         audioElement.currentTime = 0;
                         this.activeAudios.delete(audioElement);
                    }
               }

               stopAllAudios = () => {
                    this.activeAudios.forEach((audioElement) => {
                         audioElement.pause();
                         audioElement.currentTime = 0;
                         this.activeAudios.delete(audioElement);
                    });
               }

               preloadAudio = (src) => {
                    this.getAudioElement(src);
               }

               getAudioElement = (src) => {
                    if (this.audioCache.has(src)) {
                         return this.audioCache.get(src);
                    } else {
                         const audioElement = new Audio(src);
                         this.audioCache.set(src, audioElement);
                         return audioElement;
                    }
               }
          }

          const Ext = new Extension();

          return { Ext }
     })();

     // Public API
     global.$1S.Audio = {
          preload: OneSparkJs.Audio.Ext.preloadAudio,
          play: OneSparkJs.Audio.Ext.playAudio,
          stop: OneSparkJs.Audio.Ext.stopAudio,
          stopAll: OneSparkJs.Audio.Ext.stopAllAudios
     };

})(typeof window !== 'undefined' ? window : global);
