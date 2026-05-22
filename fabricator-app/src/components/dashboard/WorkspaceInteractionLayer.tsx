import { ReactNode } from 'react';
import { View } from 'react-native';
import { AnimatedWidgetContainer } from './AnimatedWidgetContainer';
import { WorkspaceTransition } from './WorkspaceTransition';

export function WorkspaceInteractionLayer({children}:{children:ReactNode}){
return <WorkspaceTransition><AnimatedWidgetContainer><View>{children}</View></AnimatedWidgetContainer></WorkspaceTransition>
}
