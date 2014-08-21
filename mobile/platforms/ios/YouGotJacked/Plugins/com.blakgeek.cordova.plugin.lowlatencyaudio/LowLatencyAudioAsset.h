//
//  LowLatencyAudioAsset.h
//  LowLatencyAudioAsset
//
//  Created by Andrew Trice on 1/23/12.
//
// THIS SOFTWARE IS PROVIDED BY ANDREW TRICE "AS IS" AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL ANDREW TRICE OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
// OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//


#import <Foundation/Foundation.h>
#import <AVFoundation/AVAudioPlayer.h>
#import <AudioToolbox/AudioToolbox.h>
#import "MXAudioPlayerFadeOperation.h"

static NSOperationQueue *audioFaderQueue = nil;
static MXAudioPlayerFadeOperation *fadeIn = nil;
static MXAudioPlayerFadeOperation *fadeOut = nil;


@interface LowLatencyAudioAsset : NSObject {
    NSMutableArray* voices;
    int playIndex;
    float maxVolume;
}

-(id) initWithPath:(NSString*) path withVoices:(NSNumber*) numVoices withVolume:(NSNumber*) volume;
- (void) play;
- (void) fadeIn:(NSNumber*) duration;
- (void) stop;
- (void) fadeOut:(NSNumber*) duration;
- (void) loop;
- (void) fadeInLoop:(NSNumber*) duration;
- (void) unload;
- (void) setVolume:(NSNumber*) volume;
@end