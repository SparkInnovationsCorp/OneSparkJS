class Workflow {
     constructor(states, initialState) {
          this.states = states;
          this.currentState = initialState;
     }

     // function to handle events
     handle(event, payload) {
          const transitions = this.states[this.currentState].transitions;
          const nextState = transitions[event];

          if (nextState) {
               const beforeTransitionFn = this.states[this.currentState].beforeTransitionOut;
               const afterTransitionFn = this.states[nextState].afterTransitionIn;
               let allowTransition = true;

               // call beforeTransition function for current state, if defined
               if (typeof beforeTransitionFn === 'function') {
                    allowTransition = beforeTransitionFn(event, payload);
               }

               if (allowTransition) {
                    this.currentState = nextState;
                    console.log(`Transitioned to state: ${this.currentState}`);

                    // call afterTransition function for next state, if defined
                    if (typeof afterTransitionFn === 'function') {
                         afterTransitionFn(payload);
                    }
               } else {
                    console.log(`State transition aborted by beforeTransition function for state: ${this.currentState}`);
               }
          } else {
               console.log(`Invalid event: ${event} for state: ${this.currentState}`);
          }
     }
}

// example usage
const states = {
     'state1': {
          transitions: {
               'event1': 'state2'
          },
          beforeTransitionOut: (event, payload) => {
               console.log('Before transition for state1');
               return true;
          },
          afterTransitionIn: (payload) => {
               console.log('After transition to state2');
          }
     },
     'state2': {
          transitions: {
               'event2': 'state3',
               'event3': 'state1'
          },
          beforeTransitionOut: (event, payload) => {
               console.log('Before transition for state2');
               return false; // abort state change
          },
          afterTransitionIn: (payload) => {
               console.log('After transition to state3');
          }
     },
     'state3': {
          transitions: {
               'event4': 'state1'
          },
          beforeTransitionOut: (event, payload) => {
               console.log('Before transition for state3');
               return true;
          }
     }
};

/*
const workflow = new Workflow(states, 'state1');
workflow.handle('event1', { data: 'payload' }); // Before transition for state1
// Transitioned to state: state2
// After transition to state2
workflow.handle('event2', { data: 'payload' }); // Invalid event: event2 for state: state2
workflow.handle('event3', { data: 'payload' }); // Before transition for state2
// State transition aborted by beforeTransition function for state: state2
workflow.handle('event4', { data: 'payload' }); // Before transition for state2
                                              // Transitioned to state: state1
*/
