// React
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

// Material UI
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

// Material Icons
import Business from '@material-ui/icons/Business';
import Event from '@material-ui/icons/Event';
import LocationOn from '@material-ui/icons/LocationOn';
import MoreHoriz from '@material-ui/icons/MoreHoriz';

// Icons
import * as icons from '@material-ui/icons';

// Our custom avatars
import LocationAvatar from './LocationAvatar';

// Helpers
import * as locationsHelper from './helpers/locations';

const styles = theme => ({
	button: {
		margin: theme.spacing.unit / 2,
	},
	card: {
		border: '1px solid #e5e5e5',
		margin: 5,
		borderRadius: theme.shape.borderRadius,
	},
	cardHeader: {
		display: 'flex',
		paddingBottom: 10
	},
	flex: {
		flex: 1,
	},
	locationHeader: {
		marginTop: '4px',
		marginLeft: '10px'
	},
	progress: {
		marginRight: theme.spacing.unit / 2
	}
});

class LocationCard extends React.Component {
	state = {
		expanded: false
	}

	render() {
		const { classes, location, events } = this.props;
		let current_event = {};
		let next_event = {};
		if (events) {
			events
				.forEach(event => {
					// Loop through times.
					event.dates.forEach(date => {
						// Is it currently happening?
						if (
							moment(date.start_date).isBefore(moment()) &&
							moment(date.endDate).isAfter(moment())
						) {
							current_event = event;
						}
						// Set next event
						if (Object.keys(next_event).length === 0) {
							next_event = event;
							next_event.date = date;
						} else {
							if (next_event.date.start_date > date.start_date) {
								next_event = event;
								next_event.date = date;
							}
						}
					});
				});
		}
		// travel time string
		let travel_messages = {};
		if (this.props.travel_types && location.travel && Object.keys(location.travel).length > 0) {
			this.props.travel_types.forEach(travel => {
				if (location.travel[travel.travel_type]) {
					const duration = parseInt(location.travel[travel.travel_type].duration);
					const duration_human = moment.duration(duration, 'minutes').humanize();
					travel_messages[travel.travel_type] = (duration_human + ' ' + travel.description.toLowerCase());
				}
			});
		}
		return (
			<Card className={classes.card} elevation={0}>
				<CardContent>
					<div className={classes.cardHeader}>
						<Tooltip title={'See more about ' + location.location_name}>
							<IconButton onClick={() => this.props.viewLocation(location.location_name)}>
								<MoreHoriz />
							</IconButton>
						</Tooltip>
						<Typography className={classes.locationHeader} variant="h6" gutterBottom>{location.location_name}</Typography>
						<span className={classes.flex}></span>
						<LocationAvatar location={location} viewLocation={() => this.props.viewLocation(location.location_name)} />
					</div>
					<Typography variant="body2" gutterBottom>
						{
							locationsHelper.checkLocationOpen(location).message
						}
					</Typography>
					{Object.keys(current_event).length > 0 ?
						<Chip
							avatar={<Avatar><Event /></Avatar>}
							color="primary"
							label={'Now: ' + current_event.title} /> :
						<Chip
							avatar={<Avatar><Event /></Avatar>}
							label={(Object.keys(next_event).length > 0 ? moment(next_event.date.start_date).format('ddd h:mma') + ' ' + next_event.title : '')} />
					}
				</CardContent>
				<CardActions>
					<Tooltip title="Move to location position">
						<IconButton onClick={() => this.props.goTo([location.longitude, location.latitude], [12], [0], [0])}>
							<LocationOn />
						</IconButton>
					</Tooltip>
					<Tooltip title="Show location building">
						<IconButton onClick={() => this.props.goTo([location.longitude, location.latitude], [18], [90], [120])}>
							<Business />
						</IconButton>
					</Tooltip>
					{
						this.props.travel_types.map(travel => {
							const Icon = icons[travel.icon];
							return <Tooltip 
										title={travel_messages && travel_messages[travel.travel_type] ?
											travel_messages[travel.travel_type] : '' }>
								<IconButton
									color={
										this.props.isochrones &&
											this.props.isochrones[location.location_name] &&
											this.props.isochrones[location.location_name][travel.travel_type] &&
											this.props.isochrones[location.location_name][travel.travel_type].selected ? 'primary' : 'default'}
									className={classes.button}
									onClick={() => this.props.toggleIsochrone(location.location_name, travel.travel_type)}>
									{this.props.isochrones &&
										this.props.isochrones[location.location_name] &&
										this.props.isochrones[location.location_name][travel.travel_type] ?
										(this.props.isochrones[location.location_name][travel.travel_type].retrieved ?
											<Icon /> : <CircularProgress className={classes.progress} size={30} />
										) : <Icon />}
									{location.walking_duration ? moment.duration(location.walking_duration, 'seconds').humanize() : ''}
								</IconButton>
							</Tooltip>
						})
					}
				</CardActions>
			</Card>
		);
	}
}

LocationCard.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(LocationCard);