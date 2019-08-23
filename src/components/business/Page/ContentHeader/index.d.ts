import * as React from 'react';
import ContentDescription from '../ContentDescription'

export interface ContentHeaderProps {
    title: string;
    titleDescription?: string;
    subTitle: string;
    action?: React.ReactNode
    showDescriptionIcon?: boolean;
    description?: string;
    helpUrl?: string;
    /**
     * 功能描述
     */
    contentDescription?: ContentDescription
}

declare const ContentHeader: (props: ContentHeaderProps) => JSX.Element;

export default ContentHeader;
