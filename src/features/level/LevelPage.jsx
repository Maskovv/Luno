import { useParams } from 'react-router-dom'
import { Level1Flow } from './level1/Level1Flow'
import { Level2Flow } from './level2/Level2Flow'
import { Level3Flow } from './level3/Level3Flow'
import { Level4Flow } from './level4/Level4Flow'
import { Level5Flow } from './level5/Level5Flow'
import { LegacyLevelPage } from './LegacyLevelPage'

export function LevelPage() {
  const { levelId } = useParams()
  if (levelId === '1') {
    return <Level1Flow />
  }
  if (levelId === '2') {
    return <Level2Flow />
  }
  if (levelId === '3') {
    return <Level3Flow />
  }
  if (levelId === '4') {
    return <Level4Flow />
  }
  if (levelId === '5') {
    return <Level5Flow />
  }
  return <LegacyLevelPage />
}
