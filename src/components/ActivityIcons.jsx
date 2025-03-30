const ActivityIcons = () => {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Image source={require('./path/to/your/running-icon.png')} style={styles.icon} />
          <Text style={styles.iconText}>Running</Text>
        </View>
        {/* Repeat for each icon */}
      </View>
    );
  };

  