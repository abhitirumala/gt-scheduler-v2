import React from 'react';
import { connect } from 'react-redux';
import {
  faAngleDown,
  faAngleUp,
  faBan,
  faCheck,
  faInfoCircle,
  faThumbtack,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import {
  classes,
  periodToString,
  simplifyName,
  unique,
  value2color,
} from '../../utils';
import { actions } from '../../reducers';
import { ActionRow, SemiPureComponent } from '../';
import './stylesheet.scss';

class Instructor extends SemiPureComponent {
  constructor(props) {
    super(props);

    this.state = {
      expanded: true,
      profGpa: 'Loading...',
    };
  }

  componentDidMount() {
    if (this.props.instructorData) {
      const instructorAverages = this.props.instructorData.filter((prof) => {
        let lastName1 = prof.profName.split(',')[0].toLowerCase();
        let profNameArr = this.props.name.split(' ');
        let lastName2 = profNameArr[profNameArr.length - 1].toLowerCase();
        return lastName1 === lastName2;
      });

      const profGpa = instructorAverages[0]
        ? instructorAverages[0].avgGpa
        : 'N/A';

      this.setState({ profGpa });
    }
  }

  handleTogglePinned(section) {
    const { pinnedCrns, excludedCrns } = this.props.user;
    if (pinnedCrns.includes(section.crn)) {
      this.props.setPinnedCrns(pinnedCrns.filter((crn) => crn !== section.crn));
    } else {
      this.props.setPinnedCrns([...pinnedCrns, section.crn]);
      this.props.setExcludedCrns(
        excludedCrns.filter((crn) => crn !== section.crn)
      );
    }
  }

  handleToggleExcluded(section) {
    const { pinnedCrns, excludedCrns } = this.props.user;
    if (excludedCrns.includes(section.crn)) {
      this.props.setExcludedCrns(
        excludedCrns.filter((crn) => crn !== section.crn)
      );
    } else {
      this.props.setExcludedCrns([...excludedCrns, section.crn]);
      this.props.setPinnedCrns(pinnedCrns.filter((crn) => crn !== section.crn));
    }
  }

  handleExcludeAll() {
    const { sections } = this.props;
    const { pinnedCrns, excludedCrns } = this.props.user;
    const crns = sections.map((section) => section.crn);
    this.props.setExcludedCrns(unique([...excludedCrns, ...crns]));
    this.props.setPinnedCrns(pinnedCrns.filter((crn) => !crns.includes(crn)));
  }

  handleIncludeAll() {
    const { sections } = this.props;
    const { excludedCrns } = this.props.user;
    const crns = sections.map((section) => section.crn);
    this.props.setExcludedCrns(
      excludedCrns.filter((crn) => !crns.includes(crn))
    );
  }

  handleToggleExpanded(expanded = !this.state.expanded) {
    this.setState({ expanded });
  }

  render() {
    const { className, color, name, sections, onSetOverlayCrns } = this.props;
    const { term, pinnedCrns, excludedCrns } = this.props.user;
    const { expanded, profGpa } = this.state;

    const instructorExcluded = sections.every((section) =>
      excludedCrns.includes(section.crn)
    );
    const instructorPinned = sections.some((section) =>
      pinnedCrns.includes(section.crn)
    );

    return (
      <div className={classes('Instructor', className)}>
        <ActionRow
          className={classes(
            'name',
            'divider-bottom',
            instructorExcluded && 'strikethrough',
            !instructorPinned && 'inactive'
          )}
          actions={[
            {
              icon: expanded ? faAngleUp : faAngleDown,
              onClick: () => this.handleToggleExpanded(),
            },
            !['TBA', 'Not Assigned'].includes(name) && {
              icon: faInfoCircle,
              href: `http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=Georgia+Institute+of+Technology&query=${encodeURIComponent(
                simplifyName(name)
              )}`,
            },
            instructorExcluded
              ? { icon: faCheck, onClick: () => this.handleIncludeAll() }
              : { icon: faBan, onClick: () => this.handleExcludeAll() },
          ]}
          color={color}
        >
          {name || 'Not Assigned'}
          {name !== 'TBA' &&
            (profGpa === 'Loading...' ? (
              <div className="avgGpa course">
                <div className="labelAverage">{profGpa}</div>
              </div>
            ) : profGpa !== 'N/A' ? (
              <div className="avgGpa course">
                <div className="labelAverage">Average GPA:</div>
                <div className="gpa" style={value2color(profGpa)}>
                  {profGpa}
                </div>
              </div>
            ) : (
              <div className="avgGpa course">
                <div className="labelAverage">Stats Not Available</div>
              </div>
            ))}
        </ActionRow>
        {expanded && (
          <div className="sections">
            {sections.map((section) => {
              const excluded = excludedCrns.includes(section.crn);
              const pinned = pinnedCrns.includes(section.crn);
              return (
                <ActionRow
                  className={classes(
                    'section',
                    'divider-bottom',
                    excluded && 'strikethrough',
                    !pinned && 'inactive'
                  )}
                  onMouseEnter={() => onSetOverlayCrns([section.crn])}
                  onMouseLeave={() => onSetOverlayCrns([])}
                  actions={[
                    {
                      icon: pinned ? faTimes : faThumbtack,
                      onClick: () => this.handleTogglePinned(section),
                    },
                    {
                      icon: faInfoCircle,
                      href: `https://oscar.gatech.edu/pls/bprod/bwckschd.p_disp_detail_sched?term_in=${term}&crn_in=${section.crn}`,
                    },
                    {
                      icon: excluded ? faCheck : faBan,
                      onClick: () => this.handleToggleExcluded(section),
                    },
                  ]}
                  color={color}
                  key={section.id}
                >
                  <div className="section-header">
                    <span className="section_id">{section.id}</span>
                  </div>
                  <div className="meetings">
                    {section.meetings.map((meeting, i) => {
                      return (
                        <div className="meeting" key={i}>
                          <span className="days">{meeting.days.join('')}</span>
                          <span className="period">
                            {periodToString(meeting.period)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ActionRow>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default connect(({ user }) => ({ user }), actions)(Instructor);
