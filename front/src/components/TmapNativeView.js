import { requireNativeComponent, UIManager, Platform, ViewPropTypes, findNodeHandle } from 'react-native';
import PropTypes from 'prop-types';
import React from 'react';

const LINKING_ERROR =
    `The package 'TmapView' doesn't seem to be linked. Make sure:\n\n` +
    Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
    '- You rebuilt the app after installing the package\n' +
    '- You are not using Expo managed workflow\n';

const COMPONENT_NAME = 'TmapView';

const TmapNativeComponent = UIManager.getViewManagerConfig
    ? UIManager.getViewManagerConfig(COMPONENT_NAME)
        ? requireNativeComponent(COMPONENT_NAME)
        : () => {
            throw new Error(LINKING_ERROR);
        }
    : requireNativeComponent(COMPONENT_NAME);

const TmapView = (props) => {
    return <TmapNativeComponent {...props} />;
};

TmapView.propTypes = {
    ...ViewPropTypes,
    onMapReady: PropTypes.func, // ✅ 반드시 있어야 Native 리스너 연결됨
};

export default TmapView;
