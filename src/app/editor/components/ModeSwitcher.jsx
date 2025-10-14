'use client'

import { usePublisher, useCellValue } from '@mdxeditor/editor'; 
// or from '@mdxeditor/gurx' if re-exported  

export default function ModeSwitcher() {
  const viewMode = useCellValue(viewMode$);        // get current mode
  const changeViewMode = usePublisher(viewMode$);  // publisher to change mode

  return (
    <div>
      <button onClick={() => changeViewMode('rich-text')}>Rich Text</button>
      <button onClick={() => changeViewMode('diff')}>Diff</button>
      <button onClick={() => changeViewMode('source')}>Source</button>
    </div>
  );
}
