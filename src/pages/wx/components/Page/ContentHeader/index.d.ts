import * as React from 'react';

export interface ContentHeaderProps {
    title: string;
    titleDescription?: string;
    subTitle: string;
    action?: React.ReactNode
    showDescriptionIcon?: boolean;
    description?: string;
}

declare const ContentHeader: (props: ContentHeaderProps) => JSX.Element;

export default ContentHeader;
