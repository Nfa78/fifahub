import { SingleEliminationBracket, Match, SVGViewer, createTheme } from '@g-loot/react-tournament-brackets';

const WhiteTheme = createTheme({
    textColor: { main: '#000000', highlighted: '#07090D', dark: '#3E414D' },
    matchBackground: { wonColor: '#daebf9', lostColor: '#96c6da' },
    score: {
        background: { wonColor: '#87b2c4', lostColor: '#87b2c4' },
        text: { highlightedWonColor: '#7BF59D', highlightedLostColor: '#FB7E94' },
    },
    border: {
        color: '#CED1F2',
        highlightedColor: '#da96c6',
    },
    roundHeader: { backgroundColor: '#da96c6', fontColor: '#000' },
    connectorColor: '#CED1F2',
    connectorColorHighlight: '#da96c6',
    svgBackground: '#FAFAFA',
});

export const WhiteThemeBracket = () => {
    const [width, height] = useWindowSize();
    const finalWidth = Math.max(width - 50, 500);
    const finalHeight = Math.max(height - 100, 500);

    return (
        <SingleEliminationBracket
            matches={simpleSmallBracket}
            matchComponent={Match}
            theme={WhiteTheme}
            options={{
                style: {
                    roundHeader: {
                        backgroundColor: WhiteTheme.roundHeader.backgroundColor,
                        fontColor: WhiteTheme.roundHeader.fontColor,
                    },
                    connectorColor: WhiteTheme.connectorColor,
                    connectorColorHighlight: WhiteTheme.connectorColorHighlight,
                },
            }}
            svgWrapper={({ children, ...props }) => (
                <SvgViewer
                    background={WhiteTheme.svgBackground}
                    SVGBackground={WhiteTheme.svgBackground}
                    width={finalWidth}
                    height={finalHeight}
                    {...props}
                >
                    {children}
                </SvgViewer>
            )}
        />
    );
};