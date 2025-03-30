import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Pressable, PanResponder, Text, ActivityIndicator } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const IS_NATIVE_DRIVER = true;

const SlideToConfirm = ({
    onSlide,
    onSlideEnd,
    onSlideRelease,
    onSlideBegin,
    onSlideConfirmed,
    onSlideNotConfirmed,
    defaultColor = "#5920BC",
    defaultIconSize = 30,
    tipAnimationEnable = true,
    tipTextSlideAnimEnable = true,
    sliderTipDuration = 300,
    sliderTipDistanceFromLeft = 40,
    goToBackDuration = 300,
    confirmedPercent = 0.8,
    ballPadding = 0,
    disableOnConfirmed = false,
    unconfirmedTipText = "",
    confirmedTipText = "",
    confirmedTipTextStyle,
    unconfirmedTipTextStyle,
    sliderButtonComponent = null,
    sliderStyle,
    loading = false, // new prop
}) => {
    const pan = useRef(new Animated.Value(0)).current;
    const textAnim = useRef(new Animated.Value(0)).current;
    const [disable, setDisable] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const sliderButtonWidth = sliderButtonComponent?.props?.style?.width || 40;

    // Ensure maxPanValue is non-negative
    const maxPanValue = 250;

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: () => !disable,
        onPanResponderGrant: (e) => {
            onSlideBegin?.(e);
            pan.setOffset(pan.__getValue());
            pan.setValue(0);
        },
        onPanResponderMove: (e, gestureState) => {
            onSlide?.(e);
            const newValue = gestureState.dx + pan._offset;
            if (newValue >= 0 && newValue <= maxPanValue) {
                pan.setValue(newValue);
            }
        },
        onPanResponderRelease: (e, gestureState) => {
            onSlideRelease?.(e);
            pan.flattenOffset();

            if (gestureState.moveX > maxPanValue * confirmedPercent) {
                Animated.spring(pan, {
                    toValue: maxPanValue,
                    useNativeDriver: IS_NATIVE_DRIVER,
                    restSpeedThreshold: 2000
                }).start(({ finished }) => {
                    if (finished) {
                        if (disableOnConfirmed) {
                            setDisable(true);
                        }
                        onSlideConfirmed?.(e);
                    }
                });
            } else {
                Animated.timing(pan, {
                    toValue: 0,
                    duration: goToBackDuration,
                    useNativeDriver: IS_NATIVE_DRIVER
                }).start(({ finished }) => {
                    if (finished) {
                        onSlideNotConfirmed?.(e);
                        if (tipAnimationEnable) {
                            slidePressed();
                        }
                    }
                });
            }
        }
    });

    const slidePressed = () => {
        if (!disable) {
            Animated.sequence([
                Animated.timing(pan, {
                    toValue: sliderTipDistanceFromLeft,
                    duration: sliderTipDuration,
                    useNativeDriver: IS_NATIVE_DRIVER
                }),
                Animated.timing(pan, {
                    toValue: 0,
                    duration: sliderTipDuration,
                    useNativeDriver: IS_NATIVE_DRIVER
                }),
            ]).start();
        }
    };

    const slideOpacity = pan.interpolate({
        inputRange: [0, maxPanValue * confirmedPercent],
        outputRange: [1, 0]
    });

    const checkOpacity = pan.interpolate({
        inputRange: [maxPanValue * confirmedPercent, maxPanValue],
        outputRange: [0, 1]
    });

    useEffect(() => {
        if (unconfirmedTipText.length && confirmedTipText.length && tipTextSlideAnimEnable) {
            Animated.loop(
                Animated.timing(textAnim, {
                    toValue: containerWidth - sliderButtonWidth,
                    duration: 2000,
                    useNativeDriver: IS_NATIVE_DRIVER
                })
            ).start();
        }
    }, [unconfirmedTipText, confirmedTipText, tipTextSlideAnimEnable, containerWidth]);

    return (
        <View 
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            style={[
                { backgroundColor: defaultColor, borderWidth: 1, borderColor: '#E3E3E3', borderRadius: 40, },
                (sliderStyle || null), { paddingLeft: ballPadding, paddingRight: ballPadding }
            ]}
        >
            <Animated.View {...panResponder.panHandlers} style={{ zIndex: 1, transform: [{ translateX: pan }] }}>
                {sliderButtonComponent ? (
                    sliderButtonComponent
                ) : (
                    <Pressable style={styles.defaultBall} onPress={() => tipAnimationEnable && slidePressed()}>
                        {!loading ? (
                            <>
                                <Animated.View style={[styles.defaultCevronRight, { opacity: slideOpacity }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Feather name='chevron-right' color={"#0F0F0F"} size={defaultIconSize} />
                                        <Feather name='chevron-right' color={"#0F0F0F"} size={defaultIconSize} style={{ marginLeft: -24 }} />
                                    </View>
                                </Animated.View>
                                <Animated.View style={[styles.defaultChecked, { opacity: checkOpacity }]}>
                                    <Feather name='check' color={defaultColor} size={defaultIconSize} />
                                </Animated.View>
                            </>
                        ) : (
                            <ActivityIndicator size="small" color="#000" />
                        )}
                    </Pressable>
                )}
            </Animated.View>
            {(unconfirmedTipText.length && confirmedTipText.length) && (
                <>
                    <Animated.Text style={[styles.tipText, { opacity: slideOpacity }, unconfirmedTipTextStyle]}>{unconfirmedTipText}</Animated.Text>
                    <Animated.Text style={[styles.tipText, { opacity: checkOpacity }, confirmedTipTextStyle]}>{confirmedTipText}</Animated.Text>
                </>
            )}
            {tipTextSlideAnimEnable && (
                <Animated.View style={[styles.textSlideAnimStyle, { transform: [{ translateX: textAnim }], backgroundColor: sliderStyle?.backgroundColor || defaultColor }]} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    tipText: {
        zIndex: 0,
        position: 'absolute',
        alignSelf: 'center',
    },
    defaultBall: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 45,
        width: 65,
        borderRadius: 40,
        backgroundColor: "#FEC93D",
        zIndex: 1
    },
    defaultCevronRight: {
        position: 'absolute',
    },
    defaultChecked: {
        position: 'absolute',
    },
    textSlideAnimStyle: {
        height: "100%",
        opacity: 0.5,
        width: 10,
        position: 'absolute',
    }
});

export default SlideToConfirm;
