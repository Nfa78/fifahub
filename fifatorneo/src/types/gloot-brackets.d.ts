// src/types/gloot-brackets.d.ts
declare module '@g-loot/react-tournament-brackets' {
    import * as React from 'react';
    export const SVGViewer: React.ComponentType<any>;
    export const SingleEliminationBracket: React.ComponentType<any>;
    export const DoubleEliminationBracket: React.ComponentType<any>;
    export const Match: React.ComponentType<any>;
    export const MATCH_STATES: Record<string, string>;
}
