export async function withSound(promice: Promise<void>): Promise<void> {
    await promice
    await playSound()
}

export async function playSound(): Promise<void> {
    const audio = new Audio('/audio.mp3')
    audio.volume = 0.5
    await audio.play()
}
