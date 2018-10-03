import * as uuid from 'uuid'

export interface SequencerInterface {
    start(): void
    stop(): void
    setTempoInBPM(bpm: number): void
}

export class Sequencer implements SequencerInterface {
    start(): void {
        console.log('Sequencer > start()')
    }
    stop(): void {
        console.log('Sequencer > stop()')
    }
    setTempoInBPM(bpm: number): void {
        console.log(`Sequencer > setTempoInBPM(${bpm})`)
    }
}

export interface BeatModelInterface {
    on(): void
    off(): void
    setBPM(bpm: number): void
    getBPM(): number
    registerBeatObserver(o: BeatObserverInterface): void
    removeBeatObserver(o: BeatObserverInterface): void
    notifyBeatObservers(): void
    registerBPMObserver(o: BPMObserverInterface): void
    removeBPMObserver(o: BPMObserverInterface): void
    notifyBPMObservers(): void
}

export class BeatModel implements BeatModelInterface {
    private beatObservers: BeatObserverInterface[] = []
    private BPMObservers: BPMObserverInterface[] = []
    private bpm = 90

    constructor(private sequencer: SequencerInterface) {}

    on(): void {
        console.log('MODEL > on()')
        this.sequencer.start()
        this.setBPM(90)
    }

    off(): void {
        console.log('MODEL > off()')
        this.setBPM(0)
        this.sequencer.stop()
    }

    // called by some Audio class we should ideally extend from
    beatEvent() {
        this.notifyBeatObservers()
    }

    getBPM(): number {
        return this.bpm
    }

    setBPM(bpm: number): void {
        console.log(`MODEL > setBPM(${bpm})`)
        this.bpm = bpm
        this.sequencer.setTempoInBPM(this.bpm)
        this.notifyBPMObservers()
    }

    // observer pattern from here
    registerBeatObserver(o: BeatObserverInterface): void {
        this.beatObservers.push(o)
        console.log(`MODEL > registerBeatObserver(${o.id})\n`)
    }
    removeBeatObserver(o: BeatObserverInterface): void {
        this.beatObservers = this.beatObservers.filter(obs => obs.id === o.id)
        console.log(`MODEL > removeBeatObserver(${o.id})\n`)
    }
    registerBPMObserver(o: BPMObserverInterface): void {
        this.BPMObservers.push(o)
        console.log(`MODEL > registerBPMObserver(${o.id})\n`)
    }
    removeBPMObserver(o: BPMObserverInterface): void {
        this.BPMObservers = this.BPMObservers.filter(obs => obs.id === o.id)
        console.log(`MODEL > registerBPMObserver(${o.id})\n`)
    }

    notifyBeatObservers() {
        console.log('MODEL > notifyBeatObservers()')
        this.beatObservers.forEach(o => o.updateBeat())
    }

    notifyBPMObservers() {
        console.log('MODEL > notifyBPMObservers()')
        this.BPMObservers.forEach(o => o.updateBPM())
    }
}

export type OnClickEvent = {
    source: 'setBPMButton' | 'increaseBPMButton' | 'decreaseBPMButton'
    bpm?: number
}

export interface BeatObserverInterface {
    id: string
    updateBeat(): void
}

export interface BPMObserverInterface {
    id: string
    updateBPM(): void
}

export class DJView implements BeatObserverInterface, BPMObserverInterface {
    id = uuid()
    constructor(private model: BeatModelInterface, private controller: ControllerInterface) {
        this.createView()
        this.model.registerBeatObserver(this)
        this.model.registerBPMObserver(this)
    }

    private createView(): void {
        console.log('VIEW > createView()')
    }

    enableStartButton() {
        console.log('VIEW > enableStartButton()')
    }

    disableStartButton() {
        console.log('VIEW > disableStartButton()')
    }

    enableStopButton() {
        console.log('VIEW > enableStopButton()')
    }

    disableStopButton() {
        console.log('VIEW > disableStopButton()')
    }

    // simulate call from user interacting with UI
    onClick(event: OnClickEvent): void {
        if (event.source === 'setBPMButton') {
            console.log('VIEW > setBPMButton clicked')
            return this.controller.setBPM(event.bpm || 0)
        }
        if (event.source === 'increaseBPMButton') {
            console.log('VIEW > increaseBPMButton clicked')
            return this.controller.increaseBPM()
        }
        if (event.source === 'decreaseBPMButton') {
            console.log('VIEW > decreaseBPMButton clicked')
            return this.controller.decreaseBPM()
        }
    }

    // observer pattern from here
    updateBPM(): void {
        const bpm = this.model.getBPM()
        if (bpm === 0) return console.log('offline')
        console.log(`VIEW > updateBPM(${bpm})`)
    }

    updateBeat(): void {
        console.log('VIEW > updateBeat()')
    }
}

export interface ControllerInterface {
    start(): void
    stop(): void
    increaseBPM(): void
    decreaseBPM(): void
    setBPM(bpm: number): void
}

export class BeatController implements ControllerInterface {
    view: DJView
    constructor(private model: BeatModelInterface) {
        this.view = new DJView(this.model, this)
    }

    start(): void {
        console.log('CONTROLLER > start()')
        this.model.on()
        this.view.disableStartButton()
        this.view.enableStopButton()
    }

    stop(): void {
        console.log('CONTROLLER > stop()')
        this.model.off()
        this.view.enableStartButton()
        this.view.disableStopButton()
    }

    increaseBPM(): void {
        console.log('CONTROLLER > increaseBPM()')
        const bpm = this.model.getBPM()
        this.model.setBPM(bpm + 1)
    }

    decreaseBPM(): void {
        console.log('CONTROLLER > decreaseBPM()')
        const bpm = this.model.getBPM()
        this.model.setBPM(bpm - 1)
    }

    setBPM(bpm: number): void {
        console.log(`CONTROLLER > setBPM(${bpm})`)
        this.model.setBPM(bpm)
    }
}

const sequencer = new Sequencer()
const model = new BeatModel(sequencer)
const controller = new BeatController(model)

console.log('\n\n---- START CONTROLLER ----')
controller.start()

// simulate UI interaction
console.log('\n\n---- INCREASE BPM ----')
controller.view.onClick({ source: 'increaseBPMButton' })
